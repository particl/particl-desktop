import { Component, OnInit } from '@angular/core';

import { SettingsService } from './settings.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { Log } from 'ng2-logger';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { SettingsGuiService } from 'app/core/settings-gui/settings-gui.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { Settings } from 'app/wallet/settings/models/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  log: any = Log.create('settings.component');
  tab: string = 'main';
  settings: Settings;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['main', 'dapps', 'display', 'network'];

  constructor(
    private _settingsService: SettingsService,
    private countryList: CountryListService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {
    this.settings = this._settingsService.currentSettings;
  }

  settingsTab(tab: string) {
    this.tab = tab;
  }

  cancel() {
    this.settings = this._settingsService.loadSettings();
  }

  save() {
    console.log(this.settings);
    this._settingsService.applySettings(this.settings);
    // @TODO move in save () subscription once cmd are available for settings.
    this.snackbar.open(
      'Settings saved sucessfully.',
      'info'
    );

  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  onCountryChange(country: Country): void {
    this.log.d('selectedCountry', country);
    this.settings.market.defaultCountry = country || undefined
    // @TODO set and use the selected Country Code and set defaut selected country by cmd?.
  }

  // set all settings as defaults.
  resetAll(): void {
    this._settingsService.applyDefaultSettings();
    // @TODO move in apply() subscription once cmd are available for settings.
    this.snackbar.open(
      'Default settings applied sucessfully.',
      'info'
    );
  }

}
