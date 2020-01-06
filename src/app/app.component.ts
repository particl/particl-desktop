import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon'; // TODO: move to material module?
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Global } from './core/store/app.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  log: any = Log.create('app.component');

  // multiwallet: any = [];

  constructor(
    private _iconRegistry: MatIconRegistry,
    private _store: Store
  ) {
    this._iconRegistry
      .registerFontClassAlias('partIcon', 'part-icon')
      .registerFontClassAlias('faIcon', 'fa');
  }

  ngOnInit() {
    // Prevent dropped files, links replacing the contents of the application.
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());

    this._store.dispatch(new Global.Initialize());
  }
}
