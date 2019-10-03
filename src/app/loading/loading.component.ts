import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router, ParamMap, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Log } from 'ng2-logger';

import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';
import { take, takeWhile } from 'rxjs/operators';
import { MarketService } from 'app/core/market/market.module';
import { termsObj } from 'app/installer/terms/terms-txt';
import { environment } from 'environments/environment';
import { Observer, Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {
  log: any = Log.create('loading.component');

  loadingMessage: string;

  private isDestroyed: boolean = false;
  private daemonChecker$: Subject<any> = new Subject<any>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private updater: UpdaterService,
    private _market: MarketService
  ) {
    this.log.i('loading component initialized');
  }

  ngOnInit() {
    this.log.i('Loading component booted!');

    /* Daemon download notifications */
    this.updater.status.asObservable().pipe(
      takeWhile(() => !this.isDestroyed)
    ).subscribe(
      status => {
        this.log.d(`updating statusMessage: `, status);
        this.loadingMessage = status;
      }
    );

    /* DETERMINE WHEN DAEMON IS READY (ie: NOT DOWNLOADING, hence above is idling)  */
    this.daemonChecker$.subscribe(
      (loadedWallets: string[]) => {
        this.checkNavigation(loadedWallets);
      }
    )
    this.doCheckConnection('listwallets');

  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.daemonChecker$.complete();
  }

  get fallbackWallet(): string | undefined {
    return localStorage.getItem('wallet');
  }

  get defaultWallet(): string {
    return '';
  }

  private goToInstaller(getwalletinfo: any) {
    this.log.d('Going to installer');
    this.router.navigate(['installer'], {
      queryParams: {
        walletname: getwalletinfo.walletname,
        encryptionstatus: getwalletinfo.encryptionstatus
      }
    });
  }

  private goToWallet(notification?: string) {
    this.log.d('MainModule: moving to new wallet', this.rpc.wallet);
    const queryParams = {
      notification: notification || ''
    };
    this.router.navigate(['wallet', 'main', 'wallet'], queryParams as NavigationExtras);
  }

  private goToTerms() {
    this.log.d('Going to terms');
    this.router.navigate(['installer', 'terms']);
  }

  private getTerms(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }

  private doCheckConnection(method: string) {
    if (this.isDestroyed) {
      return;
    }
    if (!this.rpc.enabled || !this.multi.initComplete) {
      setTimeout(this.doCheckConnection.bind(this), 1500, method);
      return;
    }
    this.rpc.call(method, []).subscribe(
      (data: any) => {
        this.daemonChecker$.next(data);
        this.daemonChecker$.complete();
      },
      (err) => {
        if (!this.isDestroyed) {
          setTimeout(this.doCheckConnection.bind(this), 1500, method);
        }
      }
    )
  }

  private getWalletInfo(wallet: string, observer: Observer<any>) {
    if (this.isDestroyed) {
      return;
    }
    if (!this.rpc.enabled) {
      setTimeout(this.getWalletInfo.bind(this), 1500, wallet, observer);
    }
    this.rpc.call('getwalletinfo', [], wallet).subscribe(
      (data: any) => {
        observer.next(data);
        observer.complete();
      },
      (err) => {
        if (!this.isDestroyed) {
          setTimeout(this.doCheckConnection.bind(this), 1000, wallet, observer);
        }
      }
    )
  }

  private async checkNavigation(loadedWallets: string[]): Promise<void> {
    // Ensure that the list of displayed wallets is updated
    this.multi.refreshWalletList();

    // Check that terms and conditions have been accepted
    const termsVersion = this.getTerms();
    if (!environment.isTesting && (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
      && termsVersion.text !== termsObj.text))) {
      this.goToTerms();
      return;
    }

    const params: ParamMap = this.route.snapshot.queryParamMap;
    this.log.d('loading params:', params);

    const allWallets = await this.multi.list.pipe(take(1)).toPromise();
    const allWalletsNames = allWallets.map(w => w.name);

    if ((allWallets.length <= 0) && (loadedWallets.length <= 0)) {
      // no wallet loaded, no wallets exists
      this.displayError();
      return;
    }

    this.log.d('existing wallets:', allWallets);

    let targetWalletName = params.get('wallet');

    if (typeof targetWalletName === 'string') {
      if (!allWalletsNames.includes(targetWalletName)) {
        // requested wallet does not exist -> check if current rpc wallet exists to fail back to
        if (typeof this.rpc.wallet === 'string' && allWalletsNames.includes(this.rpc.wallet)) {
          targetWalletName = this.rpc.wallet;
        } else {
          targetWalletName = undefined;
        }
      }
    }

    if (typeof targetWalletName !== 'string') {
      // Wallet name not specified; Application likely starting up (or invalid wallet specified)... get fallback or default wallet to load

      const fallback = this.fallbackWallet;
      if ( (typeof fallback === 'string') && allWalletsNames.includes(fallback)) {
        // fallback wallet does exist
        targetWalletName = fallback;
      }

      if (typeof targetWalletName !== 'string') {
        if (allWalletsNames.includes(this.defaultWallet)) {
          // default wallet exists
          targetWalletName = this.defaultWallet;
        } else {
          // As a last resort, try the first loaded wallet, or first unloaded wallet if none are loaded
          targetWalletName = loadedWallets.length ? loadedWallets[0] : allWallets[0].name;
        }
      }
    }

    this.log.d(`Requesting wallet: "${targetWalletName}"`);

    if (loadedWallets.includes(targetWalletName)) {
      this.log.d(`Wallet "${targetWalletName}" already loaded`);
      this.navigateToLoaded(targetWalletName);
    } else {
      this.log.d(`Wallet "${targetWalletName}" not loaded... attempting to load wallet`);
      const foundWallet = allWallets.find(w => w.name === targetWalletName);
      this.rpc.call('loadwallet', [targetWalletName]).subscribe(
        () => {
          this.navigateToLoaded(targetWalletName);
        },
        err => {
          this.log.er(`Failed to load wallet "${targetWalletName}" !!`);
          this.navigateToCurrent(loadedWallets[0]);
        }
      );
    }
  }

  private navigateToLoaded(wallet: string, message?: string) {

    new Observable((observer) => {
      this.getWalletInfo(wallet, observer);
    }).subscribe(
      async (walletinfo: any) => {
        this.log.d('wallet info found: ', walletinfo);
        if (!('hdseedid' in walletinfo)) {
          this.goToInstaller(walletinfo);
          return;
        }

        // if (this.rpc.wallet === wallet) {
        //   this.log.d('Wallet is current active wallet! Returning to current wallet');
        //   this.goToWallet(message);
        //   return;
        // }

        this.rpc.wallet = wallet;
        const allWallets = await this.multi.list.pipe(take(1)).toPromise();
        const selectedIWallet = allWallets.find(w => w.name === this.rpc.wallet);
        const isMarketWallet = selectedIWallet && selectedIWallet.isMarketEnabled === true;

        const smsgInfo: any = await this.rpc.call('smsggetinfo').toPromise().then(
          smsgState => smsgState || {},
          err => { return {}; }
        );
        let smsgActive = (smsgInfo && smsgInfo.enabled === true);


        if (!smsgActive && isMarketWallet) {
          // Attempt to enable smsg if not already enabled but this wallet is a marketplace enabled wallet (which depends on smsg)
          smsgActive = await this.rpc.call('smsgenable', [this.rpc.wallet]).toPromise().then(
            resp => true
          ).catch(err => {
            this.log.er(`FAILED to activate SMSG"`);
            return false;
          });
        }

        if (smsgActive && (smsgInfo && smsgInfo.active_wallet !== this.rpc.wallet)) {
          // Set the smsg active wallet if necessary
          await this.rpc.call('smsgsetwallet', [this.rpc.wallet]).toPromise().catch(err => {
            this.log.er(`FAILED to set SMSG active wallet to "${this.rpc.wallet}"`);
          });
        }

        if (isMarketWallet) {
          // Now start the marketplace services if this is a marketplace enabled wallet
          this._market.startMarket(this.rpc.wallet).subscribe(
            () => {
              // TODO: Leaving this here for now, but it requires the wallet to be unlocked, so doesn't work as expected.
              // It can help for first load after a Market wallet has been created though, or for an unecrypted wallet...
              //   so not removing it just yet.
              this.rpc.call('smsgscanbuckets').subscribe();
            },
            (err) => this.log.er('Request to start market failed!', err),
            () => this.goToWallet(message)
          )
        } else {
          this.goToWallet(message);
        }
      }
    );
  }

  private navigateToCurrent(wallet: string) {
    this.navigateToLoaded(this.rpc.wallet, `Failed to navigate to wallet "${wallet}"`);
  }

  private displayError() {
    this.loadingMessage = `ERROR!! Unable to determine wallets`;
  }
}
