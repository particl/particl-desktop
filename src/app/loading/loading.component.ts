import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';
import { take, takeWhile } from 'rxjs/operators';
import { MarketService } from 'app/core/market/market.module';
import { termsObj } from 'app/installer/terms/terms-txt';
import { environment } from 'environments/environment';
import { Observer, Subject, Observable } from 'rxjs';
import { SettingsStateService } from 'app/settings/settings-state.service';

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

  private currentWalletName: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private updater: UpdaterService,
    private _market: MarketService,
    private _settings: SettingsStateService
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
        this.validateNavigation(loadedWallets);
      }
    )
    this.doCheckConnection('listwallets');

  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.daemonChecker$.complete();
  }

  private goToInstaller(getwalletinfo: any) {
    this.log.d('Going to installer');
    const queryParams = {
      walletname: getwalletinfo.walletname,
      encryptionstatus: getwalletinfo.encryptionstatus
    };

    if (typeof this.currentWalletName === 'string') {
      queryParams['previouswallet'] = this.currentWalletName;
    }

    this.router.navigate(['installer'], { queryParams });
  }

  private goToWallet(notification?: string) {
    this.log.d('MainModule: moving to wallet', this.currentWalletName);
    const queryParams = {
      notification: notification || ''
    };
    this.router.navigate(['wallet', 'main', 'wallet'], { queryParams });
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
    if (!this.rpc.enabled || !this._settings.initialized) {
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

  private async validateNavigation(loadedWallets: string[]): Promise<void> {

    // Ensure that the list of displayed wallets is updated
    this.multi.refreshWalletList();

    // Check that terms and conditions have been accepted
    const termsVersion = this.getTerms();
    if (!environment.isTesting && (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
      && termsVersion.text !== termsObj.text))) {
      this.goToTerms();
      return;
    }

    const walletFromSettings = await this._settings.currentWallet().pipe(take(1)).toPromise();
    this.currentWalletName = walletFromSettings.name;

    const params: ParamMap = this.route.snapshot.queryParamMap;
    this.log.d('loading params:', params);

    const allWallets = await this.multi.list.pipe(take(1)).toPromise();
    const allWalletsNames = allWallets.map(w => w.name);

    if ((allWallets.length <= 0) && (loadedWallets.length <= 0)) {
      // no wallet loaded, no wallets exists
      this.displayError();
      return;
    }

    this.log.d('found existing wallets:', allWallets);

    let targetWalletName = params.get('wallet');

    if (typeof targetWalletName === 'string') {
      if (!allWalletsNames.includes(targetWalletName)) {
        targetWalletName = undefined;
      }
    } else {
      targetWalletName = undefined;
    }

    if (typeof targetWalletName !== 'string') {
      targetWalletName = this.currentWalletName;
    }

    this.log.d(`Requesting wallet: "${targetWalletName}"`);

    if (loadedWallets.includes(targetWalletName)) {
      this.log.d(`Wallet "${targetWalletName}" already loaded`);
      this.navigateToLoaded(targetWalletName);
    } else {
      this.log.d(`Wallet "${targetWalletName}" not loaded... attempting to load wallet`);
      this.rpc.call('loadwallet', [targetWalletName]).subscribe(
        () => {
          this.navigateToLoaded(targetWalletName);
        },
        err => {
          this.log.er(`Failed to load wallet "${targetWalletName}" -> `, err);
          this.navigateToLoaded(loadedWallets[0]);
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
          this._settings.changeRpcWalletOnly(wallet);
          this.goToInstaller(walletinfo);
          return;
        }

        // Change to the current wallet
        await this._settings.changeToWallet(wallet);

        const selectedIWallet = await this._settings.currentWallet().pipe(take(1)).toPromise();
        const isMarketWallet = selectedIWallet && selectedIWallet.isMarketEnabled === true;
        this.currentWalletName = selectedIWallet.name;

        const smsgInfo: any = await this.rpc.call('smsggetinfo').toPromise().then(
          smsgState => smsgState || {},
          err => { return {}; }
        );
        let smsgActive = (smsgInfo && smsgInfo.enabled === true);


        if (!smsgActive && isMarketWallet) {
          // Attempt to enable smsg if not already enabled but this wallet is a marketplace enabled wallet (which depends on smsg)
          smsgActive = await this.rpc.call('smsgenable', [this.currentWalletName]).toPromise().then(
            resp => true
          ).catch(err => {
            this.log.er(`FAILED to activate SMSG"`);
            return false;
          });
        }

        if (smsgActive && (smsgInfo && smsgInfo.active_wallet !== selectedIWallet.name)) {
          // Set the smsg active wallet if necessary
          await this.rpc.call('smsgsetwallet', [this.currentWalletName]).toPromise().catch(err => {
            this.log.er(`FAILED to set SMSG active wallet to "${this.currentWalletName}"`);
          });
        }

        if (isMarketWallet) {
          // Now start the marketplace services if this is a marketplace enabled wallet
          this._market.startMarket(this.currentWalletName).subscribe(
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

  private displayError() {
    this.loadingMessage = `ERROR!! Unable to connect to core to obtain wallet information`;
  }
}
