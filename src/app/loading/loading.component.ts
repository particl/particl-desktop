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
  providers: [ConnectionCheckerService]
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
              if (!this.rpc.daemonProtocol) {
                await this.rpc.call('getnetworkinfo').toPromise().then(networkinfo => {
                  if (networkinfo && +networkinfo.protocolversion) {
                    this.rpc.daemonProtocol = +networkinfo.protocolversion;
                  }
                }).catch(rpcErr => {
                  // do nothing, mostly just prevents an error from not being handled in case of an issue
                });
              }
              this.multi.refreshWalletList();
              // Swap smsg to the new wallet
              this.rpc.call('smsgdisable').subscribe(
                () => {
                  this.activateWallet(getwalletinfo, true);
                },
                (err) => {
                  this.log.er('smsgdisable failed: may already be stopped: ', err);
                  this.activateWallet(getwalletinfo, false);
                }
              );
            },
            error => this.log.d('whenRpcIsResponding errored')
          );
      });
    });
  }

  decideWhereToGoTo(getwalletinfo: any) {
    // Check the terms and conditions
    const termsVersion = this.getVersion();
    if (!environment.isTesting && (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
      && termsVersion.text !== termsObj.text))) {
      this.goToTerms();
    } else if (this.rpc.daemonProtocol < 90008) {
      this.goToStartupError();
    } else {

      this.log.d('Where are we going next?', getwalletinfo);
      if ('hdseedid' in getwalletinfo) {
        const isMarketWallet = (marketConfig.allowedWallets || []).includes(this.rpc.wallet);
        if (isMarketWallet) {
          this.startMarketService();
        } else {
          this.goToWallet();
        }
      } else {
        this.goToInstaller(getwalletinfo);
      }
    }
  }

  goToInstaller(getwalletinfo: any) {
    this.log.d('Going to installer');
    this.router.navigate(['installer'], {
      queryParams: {
        walletname: getwalletinfo.walletname,
        encryptionstatus: getwalletinfo.encryptionstatus
      }
    });
  }

  goToWallet() {
    this.log.d('MainModule: moving to new wallet', this.rpc.wallet);
    this.router.navigate(['wallet', 'main', 'wallet']);
  }

  goToTerms() {
    this.log.d('Going to terms');
    this.router.navigate(['installer', 'terms']);
  }

  goToStartupError() {
    this.log.d('Going to startup error');
    this.router.navigate(['installer', 'error']);
  }

  private startMarketService() {
    this._market.startMarket(this.rpc.wallet).subscribe(
      () => {
        // TODO: Leaving this here for now, but it requires the wallet to be unlocked, so doesn't work as expected.
        // It can help for first load after a Market wallet has been created though, so not removing it just yet.
        this.rpc.call('smsgscanbuckets').subscribe();
      },
      (err) => this.log.er('Request to start market failed!'),
      () => this.goToWallet()
    )
  }

  private activateWallet(getwalletinfo: any, startSmsg: boolean = true) {
    const isMarketWallet = (marketConfig.allowedWallets || []).includes(this.rpc.wallet);
    if (startSmsg || isMarketWallet) {
      this.rpc.call('smsgenable', [this.rpc.wallet]).subscribe(
        () => {},
        (err) => this.log.er('smsgenable failed: ', err),
        () => this.decideWhereToGoTo(getwalletinfo)
      )
    } else {
      this.decideWhereToGoTo(getwalletinfo);
    }
  }

  private getVersion(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }
}
