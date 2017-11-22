import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MdIconRegistry } from '@angular/material'; // TODO: move to material module?
import { Log } from 'ng2-logger';

import { RpcService, WindowService } from './core/core.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  log: any = Log.create('app.component');

  // multiwallet: any = [];


  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    public window: WindowService,
    private _iconRegistry: MdIconRegistry
  ) {
    _iconRegistry
      .registerFontClassAlias('partIcon', 'part-icon')
      .registerFontClassAlias('faIcon', 'fa');
  }

  ngOnInit() {

  }
}
