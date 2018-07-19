import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';

const DEFAULT_WALLET: string = "main";

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [ ConnectionCheckerService, RpcService ]
})
export class LoadingComponent implements OnInit {

  log: any = Log.create('loading.component');

  private walletToLoad: string = DEFAULT_WALLET;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private con: ConnectionCheckerService
  ) {
    console.log('loading component')
  }

  ngOnInit() {
    this.log.i('Loading component booted!');
    this.con.whenRpcIsResponding().subscribe(
      (getwalletinfo) => this.decideWhereToGoTo(getwalletinfo),
      (error) => this.log.d('whenRpcIsResponding errored')
    );
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
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      console.log('loading params', params);
      this.walletToLoad = params.get('wallet') || DEFAULT_WALLET;
    });
    this.log.d('MainModule: moving to new wallet', this.walletToLoad);
    this.router.navigate([this.walletToLoad]);
  }

}
