import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';
import { MdDialog, MdIconRegistry, MdSidenavModule, MdSidenav } from '@angular/material';

import { WindowService } from './core/window.service';
import { SettingsService } from './settings/settings.service';
import { RPCService, BlockStatusService } from './core/rpc/rpc.module';
import { ModalsService } from './modals/modals.service';

import { ModalsComponent } from './modals/modals.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './app.component.controls.scss'],
  providers: [
    SettingsService
  ]
})
export class AppComponent implements OnInit {

  log: any = Log.create('app.component');
  title: string = '';

  walletInitialized: boolean = false;
  daemonRunning: boolean = false;

  daemonError: string = '';
  walletError: string = '';

  /* Wallet menu */
  isPinned: boolean = true;
  sideMenu: boolean = true;
  unPin: string = 'Hide Menu';
  showNav: boolean = true;

  /* Old bootstrap menu, remove? */
  isCollapsed: boolean = true;
  isFixed: boolean = false;




  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    public window: WindowService,
    private _rpc: RPCService,
    private _modalsService: ModalsService,
    private dialog: MdDialog,
    private iconRegistry: MdIconRegistry
  ) {

    iconRegistry
      .registerFontClassAlias('ncIcon', 'nc-icon')
      .registerFontClassAlias('faIcon', 'fa');
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
    this._rpc.state.observe('walletInitialized')
    .subscribe(status => this.walletInitialized = status);
  }

  toggle(value: string) {
    if (value === 'toggle' && !this.window.isXS) {
      this.sideMenu = !this.sideMenu;
      return;
    }
    if (!this.sideMenu) {
      this.isPinned = value === 'enter';
    }
  }

  toggleSideNav(sidNav: MdSidenav) {
    this.showNav = !this.showNav;
    this.isPinned = true;
    this.sideMenu = true;
    sidNav.toggle(true);
  }


  /** Open createwallet modal when clicking on error in sidenav */
  createWallet() {
    this._modalsService.open('createWallet', {forceOpen: true});
  }
}
