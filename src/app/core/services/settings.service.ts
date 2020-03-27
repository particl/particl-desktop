import { Injectable } from '@angular/core';


interface SettingLiteral {
  [key: string]:  string | number | boolean;
}


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  /**
   * Fetches all of the global settings stored currently in localStorage.
   *
   * NB!! Does absolutely no validation on the types or presence of various settings stored: this is up to the caller
   */
  fetchGlobalSettings(): SettingLiteral {
    const settings = this.fetchSettings();
    return Object.prototype.toString.call(settings.global) === '[object Object]' ? settings.global : {};
  }


  fetchWalletSettings(walletName: string): SettingLiteral {
    const settings = this.fetchSettings();
    const wallets = Object.prototype.toString.call(settings.wallets) === '[object Object]' ? settings.wallets : {};
    if ((walletName in wallets) && Object.prototype.toString.call(wallets[walletName])) {
      return wallets[walletName];
    }
    return {};
  }


  fetchMarketSettings(profileID?: number): SettingLiteral {
    const settings = this.fetchSettings();
    const resp = Object.prototype.toString.call(settings.market) === '[object Object]' ? settings.market : {};
    if (!profileID) {
      delete resp['profileData'];
      return resp;
    }

    return Object.prototype.toString.call(resp.profileData) === '[object Object]' &&
      Object.prototype.toString.call(resp.profileData[`${profileID}`]) === '[object Object]' ?
      resp.profileData[`${profileID}`] || {} : {};
  }


  saveGlobalSetting(key: string, value: boolean | string | number): boolean {
    // @TODO: zaSmilingIdiot 2020-01-14 -> potential for conflicts to happen... not "thread safe"

    if (!['boolean', 'string', 'number'].includes(typeof value)) {
      return false;
    }

    const saved = this.fetchSettings();
    const global = Object.prototype.toString.call(saved.global) === '[object Object]' ? saved.global : {};
    if (global[key] && (typeof global[key] !== typeof value)) {
      return false;
    }
    global[key] = value;
    saved.global = global;
    localStorage.setItem('settings', JSON.stringify(saved));
    return true;
  }


  saveWalletSetting(walletName: string, key: string, value: boolean | string | number ): boolean {
    // @TODO: zaSmilingIdiot 2020-02-10 -> potential for conflicts to happen... not "thread safe"
    if (!['boolean', 'string', 'number'].includes(typeof value)) {
      return false;
    }
    const saved = this.fetchSettings();
    const wallets = Object.prototype.toString.call(saved.wallets) === '[object Object]' ? saved.wallets : {};
    const wallet = Object.prototype.toString.call(wallets[walletName]) === '[object Object]' ? wallets[walletName] : {};
    wallet[key] = value;
    wallets[walletName] = wallet;
    saved.wallets = wallets;
    localStorage.setItem('settings', JSON.stringify(saved));

    return true;
  }


  saveMarketSetting(key: string, value: boolean | string | number, profileID?: number): boolean {
    // @TODO: zaSmilingIdiot 2020-02-10 -> potential for conflicts to happen... not "thread safe"
    if (!['boolean', 'string', 'number'].includes(typeof value)) {
      return false;
    }
    const saved = this.fetchSettings();
    const market = Object.prototype.toString.call(saved.market) === '[object Object]' ? saved.market : {};
    if (profileID !== undefined) {

      if (!(typeof profileID === 'number' && Number.isSafeInteger(profileID))) {
        return false;
      }

      const profileData = Object.prototype.toString.call(market.profileData) === '[object Object]' ? market.profileData : {};
      const idStr = `${profileID}`;
      const profile = Object.prototype.toString.call(profileData[idStr]) === '[object Object]' ? profileData[idStr] : {};
      profile[key] = value;
      profileData[idStr] = profile;
      market.profileData = profileData;
    } else {
      market[key] = value;
    }
    saved.market = market;
    localStorage.setItem('settings', JSON.stringify(saved));

    return true;
  }


  private fetchSettings(): any {
    return JSON.parse(localStorage.getItem('settings') || '{}') || {};
  }
}
