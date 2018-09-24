import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [
    SettingsService
  ]
})

export class SettingsComponent implements OnInit {

  tab: string = 'main';
  settings: Object;

  constructor(
    private _settingsService: SettingsService,
    private _location: Location
  ) { }

  ngOnInit() {
    /* Preload default settings if none found */
    if (localStorage.getItem('settings') == null) {
      const settings: string = JSON.stringify(this._settingsService.defaultSettings);
      localStorage.setItem('settings', settings);
    }
    this.settings = this._settingsService.loadSettings();
  }

  settingsTab(tab: string) {
    this.tab = tab;
    if (tab === 'help') {
      // const dialogRef = this.dialog.open(ConsoleModalComponent);
    }
  }

  apply() {
    this._settingsService.applySettings(this.settings);
  }

  cancel() {
    this.settings = this._settingsService.loadSettings();
    this._location.back();
  }

  validate() {
    this.apply();
    this._location.back();
  }

}
