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


  saveGlobalSetting(key: string, value: any): boolean {
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

  private fetchSettings(): any {
    return JSON.parse(localStorage.getItem('settings') || '{}') || {};
  }
}
