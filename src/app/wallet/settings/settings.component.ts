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
  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['main', 'network', 'window', 'display', 'help', 'I2P', 'TOR'];

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

  changeTab(index: number): void {
    this.selectedTab = index;
  }
}
