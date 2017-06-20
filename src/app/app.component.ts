import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { WindowService } from './core/window.service';

import { SettingsService } from './settings/settings.service';

// TODO remove
import { FirstTimeModalComponent } from './modal/firsttime/firsttime.modal.component';
import { ModalService } from './modal/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    SettingsService
  ]
})
export class AppComponent implements OnInit {
  isCollapsed: boolean = true;
  isFixed: boolean = false;
  title: string = '';
  window: WindowService;

  // TODO remove
  message: Object;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _windowService: WindowService,
    private _settingsService: SettingsService,
    private _modalService: ModalService
  ) {
    this.window = this._windowService;
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
      .subscribe(data => this.title = data.title);

    // TODO remove
    this.message = {
      component: FirstTimeModalComponent,
      inputs: {
        sync: 20
      }
    };
  }

  // TODO remove
  firsttime() {
    this._modalService.open('firsttime');
  }
}
