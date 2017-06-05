import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { WindowService } from './core/window.service';

import { SettingsService } from './settings/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [SettingsService]
})
export class AppComponent implements OnInit {
  isCollapsed: boolean = true;
  isFixed: boolean = false;
  title: string = '';
  window: WindowService;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _windowService: WindowService,
    private _settingsService: SettingsService
  ) {
    this.window = this._windowService;
  }

  ngOnInit() {

    /* Preload default settings if none found */
    if (localStorage.getItem('settings') == null) {
      const settings: string = JSON.stringify(this._settingsService.defaultSettings);
      localStorage.setItem('settings', settings);
    }

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
      .subscribe(data => this.title = data.title);
  }
}
