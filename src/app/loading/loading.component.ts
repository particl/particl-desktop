import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { IWallet, MultiwalletService } from 'app/multiwallet/multiwallet.service';

const DEFAULT_WALLET ='wallet.dat';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [RpcService, ConnectionCheckerService]
})
export class LoadingComponent implements OnInit {

  log: any = Log.create('loading.component');

  private walletToLoad: string = DEFAULT_WALLET;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private con: ConnectionCheckerService
  ) {
    console.log('loading component');

    // we wait until the multiwallet has retrieved the wallets
    this.multi.list.take(1).subscribe(wallets => {
      // we also pass through the loading screen to switch wallets
      // check if a wallet was specified
      this.route.queryParamMap.take(1).subscribe((params: ParamMap) => {
        console.log('loading params', params);
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
        this.con.whenRpcIsResponding().subscribe(
          (getwalletinfo) => this.decideWhereToGoTo(getwalletinfo),
          (error) => this.log.d('whenRpcIsResponding errored')
        );
      });
    })

  }

  ngOnInit() {
    this.log.i('Loading component booted!');
  }

  decideWhereToGoTo(getwalletinfo: any) {
    this.log.d('Where are we going next?', getwalletinfo);
    if ('hdmasterkeyid' in getwalletinfo) {
      this.goToWallet();
    } else {
      if (getwalletinfo.encryptionstatus === 'Unencrypted') {
        this.goToInstaller();
      } else {
        this.goToCreateWallet();
      }
    }
  }

  goToInstaller() {
    this.log.d('Going to installer');
    this.router.navigate(['installer']);
  }

  goToCreateWallet() {
    this.log.d('Going to installer/create');
    this.router.navigate(['installer/create']);
  }

  goToWallet() {
    this.log.d('MainModule: moving to new wallet', this.walletToLoad);
    this.router.navigate([this.walletToLoad]);
  }

}
