import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';


interface SettingLiteral {
  [key: string]:  string | number | boolean
};


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private log: any = Log.create('settings-state.service id:' + Math.floor((Math.random() * 1000) + 1));

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


  private fetchSettings(): any {
    return JSON.parse(localStorage.getItem('settings') || '{}') || {};
  }
}
