import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';


@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [ ConnectionCheckerService ]
})
export class LoadingComponent implements OnInit {

  log: any = Log.create('loading.component');

  constructor(
    private router: Router,
    private con: ConnectionCheckerService
  ) { }

  ngOnInit() {
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
    this.router.navigate(['installer']);
  }

  goToCreateWallet() {
    this.router.navigate(['installer/create']);
  }

  goToWallet() {
    this.router.navigate(['wallet/main']);
  }

}
