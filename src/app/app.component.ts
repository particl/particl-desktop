import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Log } from 'ng2-logger';

import { RpcService, WindowService } from './core/core.module';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // './app.component.controls.scss'
})
export class AppComponent implements OnInit {
  log: any = Log.create('app.component');

  blocks: number = 0;
  error: string = '';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    public window: WindowService,
    private _test: RpcService
  ) {


  }

  ngOnInit() {

  }

  pollBlocks() {
    this._test.call('getblockcount').subscribe(
                    success => this.blocks = success,
                    error => this.error = error);
  }

}
