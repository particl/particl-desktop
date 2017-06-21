import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { AppService } from './app.service';
import { WindowService } from './core/window.service';

import { SettingsService } from './settings/settings.service';
// Modal example
import { ModalsService } from './modals/modals.service';

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

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private appService: AppService,
    public window: WindowService,
    private _settingsService: SettingsService,
    // Modal example
    private _modalsService: ModalsService
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

  recover() {
    this._modalsService.open('recover');
    this._modalsService.updateProgress(100);
  }
  // End Modal Examples
}
