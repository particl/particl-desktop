import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { SettingsService } from './settings.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { Log } from 'ng2-logger';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { SettingsGuiService } from 'app/core/settings-gui/settings-gui.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [
    SettingsService
  ]
})

export class SettingsComponent implements OnInit {
  log: any = Log.create('settings.component');
  tab: string = 'main';
  settings: Object;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['main', 'dapps', 'display', 'network'];

  constructor(
    private _settingsService: SettingsService,
    private _settingsGuiService: SettingsGuiService,
    private _location: Location,
    private countryList: CountryListService
  ) { }

  ngOnInit() {
    this.settings = this._settingsService.currentSettings;
  }

  settingsTab(tab: string) {
    this.tab = tab;
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

  onCountryChange(country: Country): void {
    this.log.d('selectedCountry', country);
    this.settings['market'].defaultCountry = country || undefined
    // @TODO set and use the selected Country Code and set defaut selected country by cmd?.
  }

  /*
    Should be remove once we have everything with saving button stuff.
  */
  minimize(): void {
    this._settingsGuiService.minimizeElectronOnClose(this.settings);
  }
}
