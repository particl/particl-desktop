import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { Log } from 'ng2-logger';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  log: any = Log.create('app.component');

  constructor(
    private _iconRegistry: MatIconRegistry
  ) {
    this._iconRegistry
      .registerFontClassAlias('partIcon', 'part-icon');
  }

  ngOnInit() {
    // Prevent dropped files, links replacing the contents of the application.
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());
  }
}
