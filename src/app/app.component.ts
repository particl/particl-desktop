import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { AppService } from './app.service';
import { WindowService } from './core/window.service';

import { SettingsService } from './settings/settings.service';
// Modal example
import { ModalService } from './modal/modal.service';

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
    private _modalService: ModalService
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

  // Modal example
  firsttime() {
    this._modalService.open('firstTime');
    this._modalService.updateProgress(48);
  }
  syncing() {
    this._modalService.open('syncing');
    this._modalService.updateProgress(100);
  }
}
