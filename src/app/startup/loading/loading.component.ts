import { Component, ViewEncapsulation } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  log: any = Log.create('loading.component');

  loadingMessage: Observable <string>;

  constructor(
    private _store: Store
  ) {
    this.log.i('loading component initialized');
    this.loadingMessage = this._store.select(state => state.global.loadingMessage);
  }
}
