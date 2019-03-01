import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';

const DEFAULT_WALLET = '';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [RpcService, ConnectionCheckerService, UpdaterService]
})
export class LoadingComponent implements OnInit {
  log: any = Log.create('loading.component');

  private walletToLoad: string;
  loadingMessage: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private con: ConnectionCheckerService,
    private updater: UpdaterService
  ) {
    this.log.i('loading component initialized');
    this.walletToLoad = DEFAULT_WALLET;
  }

  ngOnInit() {
    this.log.i('Loading component booted!');

    /* Daemon download  */
    this.updater.status.asObservable().subscribe(status => {
      this.log.d(`updating statusMessage: `, status);
      this.loadingMessage = status;
    });

    // we wait until the multiwallet has retrieved the wallets
    this.multi.list.take(1).subscribe(wallets => {
      // we also pass through the loading screen to switch wallets
      // check if a wallet was specified
      this.route.queryParamMap.take(1).subscribe((params: ParamMap) => {
        this.log.d('loading params', params);
        // we can only pass strings through
        const switching = params.get('wallet');
        if (switching) {
          // one was specified
          this.walletToLoad = switching;
        } // else just load DEFAULT_WALLET

        // either load the switching wallet or the default
        this.rpc.wallet = this.walletToLoad;

        // kick off the connection checker
        // only after we have a wallet or default
        this.con
          .whenRpcIsResponding()
          .subscribe(
            getwalletinfo => this.decideWhereToGoTo(getwalletinfo),
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
    this.log.d('MainModule: moving to new wallet', this.walletToLoad);
    this.router.navigate([this.walletToLoad ? this.walletToLoad : '[default]', 'main', 'wallet', 'overview']);
  }
}
