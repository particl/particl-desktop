import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';
import { take } from 'rxjs/operators';
import { MarketService } from 'app/core/market/market.module';

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
            getwalletinfo => {
              // Swap smsg to the new wallet
              this.rpc.call('smsgdisable').subscribe(
                () => this.rpc.call('smsgenable', [this.rpc.wallet]).subscribe(
                  () => {
                    // If we dealing with the market wallet start the market while the loading screen shows
                    if ((marketConfig.allowedWallets || []).includes(this.rpc.wallet)) {
                      this._market.startMarket(this.rpc.wallet).subscribe(
                        () => {
                          this.rpc.call('smsgscanbuckets').subscribe();
                          this.decideWhereToGoTo(getwalletinfo);
                        },
                        error => this.log.d('Starting market failed: ', error)
                      );
                    } else {
                      this.decideWhereToGoTo(getwalletinfo);
                    }
                  }
                ),
                (err) => { this.log.er('smsgdisable failed: may already be stopped: ', err)}
              );
            },
            error => this.log.d('whenRpcIsResponding errored')
          );
      });
    });
  }

  decideWhereToGoTo(getwalletinfo: any) {
    this.log.d('Where are we going next?', getwalletinfo);
    if ('hdseedid' in getwalletinfo) {
      this.goToWallet();
    } else {
      this.goToInstaller(getwalletinfo);
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
}
