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
    const settings = JSON.parse(localStorage.getItem('settings') || '{}') || {};
    return Object.prototype.toString.call(settings.global) === '[object Object]' ? settings.global : {};
  }


}
