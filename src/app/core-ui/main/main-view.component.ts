import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';

import { RpcService } from '../../core/core.module';
import { ModalsService } from '../../modals/modals.module';

import { StatusComponent } from './status/status.component';
/*
 * The MainView is basically:
 * sidebar + router-outlet.
 * Will display the _main_ sidebar (not wallet picker)
 * and display wallet + market views.
 */
@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  log: any = Log.create('main-view.component');

  /* UI States */

  title: string = '';

  /* errors */
  walletInitialized: boolean = undefined;
  daemonRunning: boolean = undefined;
  daemonError: string;
  /* version */
  daemonVersion: string;
  clientVersion: string = environment.version;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _rpc: RpcService,
    private _modals: ModalsService
  ) { }

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


    /* errors */
    // Updates the error box in the sidenav whenever a stateCall returns an error.
    this._rpc.errorsStateCall.asObservable()
    .throttle(val => Observable.interval(30000/*ms*/))
    .subscribe(status => this.daemonRunning = true,
                error => {
                  this.daemonRunning = ![0, 502].includes(error.status);
                  this.daemonError = error;
                });

    // Updates the error box in the sidenav if wallet is not initialized.
    this._rpc.state.observe('ui:walletInitialized')
    .subscribe(status => this.walletInitialized = status);


    /* versions */
    // Obtains the current daemon version
    this._rpc.state.observe('subversion')
    .subscribe(
      subversion => this.daemonVersion = subversion.match(/\d+\.\d+.\d+.\d+/)[0]);
  }

  /** Open createwallet modal when clicking on error in sidenav */
  createWallet() {
    this._modals.open('createWallet', {forceOpen: true});
  }

  /** Open syncingdialog modal when clicking on progresbar in sidenav */
  syncScreen() {
    this._modals.open('syncing', {forceOpen: true});
  }

}
