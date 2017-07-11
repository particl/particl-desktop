import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger'

import { WindowService } from './core/window.service';
import { RPCService, PeerService } from './core/rpc/rpc.module';

import { SettingsService } from './settings/settings.service';
// Modal example
import { ModalsService } from './modals/modals.service';
import {Logger} from 'ng2-logger/src/logger';

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

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    public window: WindowService,
    private _rpc: RPCService,
    private _peer: PeerService,
    private _settingsService: SettingsService,
    // Modal example
    private _modalsService: ModalsService
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

    const bcSub = this._peer.getBlockCount()
      .subscribe(
        height => {
          const nbcSub = this._peer.getBlockCountNetwork()
            .subscribe(
              networkHeight => {
                bcSub.unsubscribe();
                nbcSub.unsubscribe();

                if (networkHeight === -1 || height === -1) {
                  // no peers (networkHeight is -1), or height === -1 (unable to call getblockcount)
                  alert( networkHeight === -1 ? 'No peers!' : 'Unable to retrieve blockcount - rpc connection issues!');
                  return;
                }

                if (height < networkHeight) {
                  this._modalsService.open('syncing');
                  this._modalsService.updateProgress(height / networkHeight * 100);
                }

              }
            )
        }
      );

    this._rpc.poll();
    this._rpc.specialPoll();

    this.log.er('error!');
    this.log.w('warn!');
    this.log.i('info');
    this.log.d('debug');
  }

  // Modal examples
  firsttime() {
    this._modalsService.open('firstTime');
    this._modalsService.updateProgress(33);
  }

  syncing() {
    this._modalsService.open('syncing');
    this._modalsService.updateProgress(48);
  }

  unlock() {
    this._modalsService.open('unlock');
    this._modalsService.updateProgress(99);
  }

  checkIfSyncing() {

  }

  // End Modal Examples
}
