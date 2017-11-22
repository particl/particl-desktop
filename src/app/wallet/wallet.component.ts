import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';
import { MdDialog } from '@angular/material';

import { WindowService } from '../core/core.module';
// import { SettingsService } from './settings/settings.service';
import { RpcService, BlockStatusService } from '../core/rpc/rpc.module';
import { ModalsService } from '../modals/modals.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  providers: [
    // SettingsService
  ]
})
export class WalletViewsComponent implements OnInit {
  isCollapsed: boolean = true;
  isFixed: boolean = false;
  title: string = '';
  log: any = Log.create('app.component');
  walletInitialized: boolean = false;
  daemonRunning: boolean = false;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    public window: WindowService,
    private _rpc: RpcService,
    private _modalsService: ModalsService,
    private dialog: MdDialog,
  ) {
  }

  ngOnInit() {
    // Change the header title derived from route data
    // Source: https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this._route)
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .flatMap(route => route.data)
      .subscribe(data => this.title = data['title']);

    // Show logging colors
    this.log.er('error!');
    this.log.w('warn!');
    this.log.i('info');
    this.log.d('debug');

    // Display errors in sidenav when required */

    // Updates the error box in the sidenav whenever a stateCall returns an error.
    this._rpc.errorsStateCall.asObservable()
    .subscribe(status => this.daemonRunning = true,
               error => this.daemonRunning = [0, 502].includes(error.status));

    // Updates the error box in the sidenav if wallet is not initialized.
    this._rpc.state.observe('ui:walletInitialized')
    .subscribe(status => this.walletInitialized = status);
  }

  /** Open createwallet modal when clicking on error in sidenav */
  createWallet() {
    this._modalsService.open('createWallet', {forceOpen: true});
  }
}
