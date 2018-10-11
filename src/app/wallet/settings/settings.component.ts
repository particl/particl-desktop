import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RpcService } from 'app/core/rpc/rpc.service';
import { SettingsService } from './settings.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { Log } from 'ng2-logger';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { Settings } from 'app/wallet/settings/models/settings.model';
import { AddressHelper, DEFAULT_GUI_SETTINGS, NetworkHelper } from '../../core/util/utils';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {
  log: any = Log.create('settings.component');
  tab: string = 'main';
  settings: Settings;
  validRewardAddress: boolean;
  isMineAddress: boolean;
  isValidIp: boolean;
  isValidPort: boolean;
  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['main', 'dapps', 'display', 'network'];
  private addressHelper: AddressHelper;
  private networkHelper: NetworkHelper;

  constructor(
    private _settingsService: SettingsService,
    private countryList: CountryListService,
    private _modals: ModalsHelperService,
    private snackbar: SnackbarService,
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this.addressHelper = new AddressHelper();
    this.networkHelper = new NetworkHelper();
    this.settings = new Settings(this._settingsService.currentSettings);
  }

  settingsTab(tab: string) {
    this.tab = tab;
  }

  cancel() {
    this.settings = this._settingsService.loadSettings();
  }

  save() {
    this.log.d(this.settings);

    /**
     * update the changedKeys
     * which is responsible to load the all changed keys in the setting object.
     */

    this._settingsService.setChangedKeys(this.settings);


    // call update reserveAmount if reserveAmount updated?
    if (this._settingsService.isSettingKeysUpdated(['main.reserveAmount'])) {
      this._modals.unlock({timeout: 30}, (status) => this.reserveBalanceCall());
    }

    if (this._settingsService.isSettingKeysUpdated(
      ['main.stake', 'main.foundationDonation', 'main.rewardAddress', 'main.rewardAddressEnabled']
    )) {
      this._modals.unlock({timeout: 30}, (status) => this.updateStakingOptions());
    }

    this._settingsService.applySettings(this.settings);

    // @TODO move in save () subscription once cmd are available for settings.
    this.snackbar.open(
      'Settings updated sucessfully.',
      'info'
    );
  }

  updateStakingOptions(): void {
    let stakeParams = Object.assign({}, {
      enabled: this.settings.main.stake,
      foundationdonationpercent: this.settings.main.foundationDonation
    });

    if (
      this.settings.main.rewardAddressEnabled &&
      this._settingsService.isSettingKeysUpdated(['main.rewardAddress'])
    ) {
      stakeParams = Object.assign(
        stakeParams, {
          rewardAddress: this.settings.main.rewardAddress
        }
      );
    }

    this._rpc.call('walletsettings', ['stakingoptions', stakeParams]).subscribe(
      (response) => this.log.d(response),
      (error) => this.log.d(error));
  }

  reserveBalanceCall() {
    this._rpc.call('reservebalance', [this.settings.main.rewardAddressEnabled, this.settings.main.reserveAmount]).subscribe(
      (response) => this.log.d(response),
      (error) => this.log.d(error));
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  onCountryChange(country: Country): void {
    this.log.d('selectedCountry', country);
    this.settings.market.defaultCountry = country || undefined
  }

  // set all settings as defaults.
  resetAll(): void {
    this.settings = new Settings(DEFAULT_GUI_SETTINGS);
    this.save();
  }

  /** checkAddres: returns boolean, so it can be private later. */
  checkAddress(): boolean {
    return (
      this.validRewardAddress &&
      this.addressHelper.testAddress(this.settings.main.rewardAddress, 'public')
    );
  }

  /** verifyAddress: calls RPC to validate it. */
  verifyAddress() {
    if (!this.settings.main.rewardAddress) {
      this.validRewardAddress = undefined;
      this.isMineAddress = undefined;
      return;
    }

    const validateAddressCB = (response) => {
      this.validRewardAddress = response.isvalid;

      if (!!response.ismine) {
        this.isMineAddress = response.ismine;
      }
    };

    this._rpc.call('validateaddress', [this.settings.main.rewardAddress])
      .take(1)
      .subscribe(
        response => validateAddressCB(response),
        error => this.log.er('verifyAddress: validateAddressCB failed'));
  }

  verifyIpAddress(): boolean {
    this.isValidIp = this.networkHelper.validateIp(this.settings.network.proxyIP);
    return this.isValidIp;
  }

  checkIpAddress(): boolean {
    return this.isValidIp;
  }

  verifyPort(): boolean {
    this.isValidPort = this.networkHelper.validatePort(this.settings.network.proxyPort);
    return this.isValidPort;
  }

  checkPort(): boolean {
    return this.isValidPort;
  }

  settingsValidator(): boolean {
    return  (
      (
        !this.settings.main.rewardAddressEnabled ||
        (this.settings.main.rewardAddressEnabled && this.checkAddress() !== false)
      ) && (
        !this.settings.network.enabledProxy ||
        (
          (this.settings.network.enabledProxy && this.checkIpAddress() !== false) &&
          (this.settings.network.enabledProxy && this.checkPort() !== false)
        )
      )
    )
  }
}
