import { Component } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcService, WindowService } from './core/core.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  log: any = Log.create('app.component');

  blocks: number = 0;
  error: string = '';

  constructor(public window: WindowService,
              private _test: RpcService) {
  }

  pollBlocks() {
    this._test.call('getblockcount').subscribe(
      success => this.blocks = success,
      error => this.error = error);
  }
}
