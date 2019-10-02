import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';
import { take } from 'rxjs/operators';
import { MarketService } from 'app/core/market/market.module';
import { termsObj } from 'app/installer/terms/terms-txt';
import { environment } from 'environments/environment';

import * as marketConfig from '../../../modules/market/config.js';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [ConnectionCheckerService, UpdaterService]
})
export class LoadingComponent implements OnInit {
  log: any = Log.create('loading.component');

  loadingMessage: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private con: ConnectionCheckerService,
    private updater: UpdaterService,
    private _market: MarketService
  ) {
    this.log.i('loading component initialized');
  }

  ngOnInit() {
    this.log.i('Loading component booted!');

    /* Daemon download  */
    this.updater.status.asObservable().subscribe(status => {
      this.log.d(`updating statusMessage: `, status);
      this.loadingMessage = status;
    });

    // we wait until the multiwallet has retrieved the wallets
    this.multi.list.pipe(take(1)).subscribe(wallets => {
      // we also pass through the loading screen to switch wallets
      // check if a wallet was specified
      this.route.queryParamMap.pipe(take(1)).subscribe((params: ParamMap) => {
        this.log.d('loading params', params);
        // we can only pass strings through
        const switching = params.get('wallet');
        if (switching !== null && switching !== undefined) {
          // one was specified
          this.rpc.wallet = switching;
        }

        this.con.performCheck();

        // kick off the connection checker
        // only after we have a wallet or default
        this.con
          .whenRpcIsResponding()
          .subscribe(
            async getwalletinfo => {
              this.multi.refreshWalletList();
              // Get smsg service status
              const smsgInfo: any = await this.rpc.call('smsggetinfo').toPromise().then(
                smsgState => smsgState || {},
                err => { return {}; }
              );

              // Check the terms and conditions
              const termsVersion = this.getTerms();
              if (!environment.isTesting && (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
                && termsVersion.text !== termsObj.text))) {
                this.goToTerms();
              } else {
                // Check the actual wallet status
                this.log.d('Where are we going next?', getwalletinfo);
                if ('hdseedid' in getwalletinfo) {
                  // Wallet has been created correctly
                  const selectedIWallet = wallets.find(w => w.name === this.rpc.wallet);
                  const isMarketWallet = selectedIWallet && selectedIWallet.isMarketEnabled === true;
                  let smsgActive = (smsgInfo && smsgInfo.enabled === true);

                  if (!smsgActive && isMarketWallet) {
                    // Attempt to enable smsg if not already enabled but this wallet is a marketplace enabled wallet
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
                      () => this.goToWallet()
                    )
                  } else {
                    this.goToWallet();
                  }
                } else {
                  // Wallet needs to be created first
                  this.goToInstaller(getwalletinfo);
                }
              }

            },
            error => this.log.d('whenRpcIsResponding errored')
          );
      });
    });
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

  private goToWallet() {
    this.log.d('MainModule: moving to new wallet', this.rpc.wallet);
    this.router.navigate(['wallet', 'main', 'wallet']);
  }

  private goToTerms() {
    this.log.d('Going to terms');
    this.router.navigate(['installer', 'terms']);
  }

  private getTerms(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }
}
