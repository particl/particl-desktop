import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material'; // TODO: move to material module?
import { Log } from 'ng2-logger';
import { ModalsService } from './modals/modals.service';

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
    private _modalsService: ModalsService
  ) {
    _iconRegistry
      .registerFontClassAlias('partIcon', 'part-icon')
      .registerFontClassAlias('faIcon', 'fa');
  }

  ngOnInit() {
     this.openMultiwallet();
  }

  /** Open multiwallet  */
  openMultiwallet(): void {
    this._modalsService.open('multiwallet')
  }
}
