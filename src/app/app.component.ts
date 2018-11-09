import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material'; // TODO: move to material module?
import { Log } from 'ng2-logger';

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
  ) {
    _iconRegistry
      .registerFontClassAlias('partIcon', 'part-icon')
      .registerFontClassAlias('faIcon', 'fa');
  }

  ngOnInit() {
    // Prevent dropped files, links replacing the contents of the application.
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());
  }
}
