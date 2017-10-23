import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';
import { MdDialog, MdIconRegistry } from '@angular/material';

import { WindowService } from './core/window.service';

import { SettingsService } from './settings/settings.service';

import { RPCService } from './core/rpc/rpc.service';
import { ModalsService } from './modals/modals.service';

// Syncing example
import { BlockStatusService } from './core/rpc/blockstatus.service';
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
  isCollapsed: boolean = true;
  isFixed: boolean = false;
  title: string = '';
  log: any = Log.create('app.component');
  walletInitialized: boolean = false;
  daemonRunning: boolean = false;
  daemonError: string = '';
  walletError: string = '';
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

    this.log.er('error!');
    this.log.w('warn!');
    this.log.i('info');
    this.log.d('debug');

    this._rpc.modalUpdates.asObservable().subscribe(status => {
      this.daemonRunning = !status.error;
      this.daemonError = this.daemonRunning ? '' : 'Connection Refused, Daemon is not connected';
    });

    this._rpc.state.observe('walletInitialized')
      .subscribe(
        status => {
          this.walletInitialized = status;
          this.walletError = status ? '' : 'Please create wallet first to access other tabs';
      });
  }


  createWallet() {
    // this.dialog.open(ModalsComponent, {disableClose: true, width: '100%', height: '100%'});
    this._modalsService.open('createWallet', {forceOpen: true});
  }
}
