import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BackendService } from 'app/core/services/backend.service';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';


interface Setting<T> {
  value: T;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface JsonLike {
  [key: string]: string | number | boolean | JsonLike | JsonLike[];
}

export interface Settings {
  [key: string]: Setting<string | number | boolean | Array<string | number | boolean>>;
}

namespace Responses {

  interface GenericSettings {
    core: string;
    request: 'settings';
    response: any;
    hasError: boolean;
  }

  export interface ParticlSettings extends GenericSettings {
    response: {
      schema: JsonLike;
      values: JsonLike;
      startedparams: any;
    };
  }

  export interface GenericUpdateSettings {
    core: string;
    request: 'update';
    response: boolean | undefined;
    hasError: boolean;
  }
}


@Injectable()
export class CoreConfigurationService {

  private destroy$: Subject<void>;
  private initialized: boolean = false;
  private settings$: BehaviorSubject<Settings | null>;


  constructor(
    private _store: Store,
    private _backendService: BackendService,
  ) { }


  _init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.destroy$ = new Subject();
    this.settings$ = new BehaviorSubject(null);

    this._backendService.sendAndWait<Responses.ParticlSettings>('coreManager:settings', 'particl').pipe(
      map(resp => this.parseParticlSettings(resp)),
      catchError(() => of(null)),
      tap({
        next: (settings) => {
          if ((settings !== null) && (Object.keys(settings).length > 0)) {
            this.settings$.next(settings);
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  _teardown(): void {
    if (!this.initialized) {
      return;
    }
    this.settings$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.initialized = false;
  }


  getSettings(): Observable<Settings | null> {
    if (!this.initialized) {
      return of(null);
    }
    return this.settings$.asObservable();
  }


  setSetting(settings: {[key: string]: any}) {
    if (!this.initialized) {
      return of(false);
    }

    const currentSettings = this.settings$.value;
    if (currentSettings === null) {
      return of(false);
    }
    let isValid = true;
    const validKeys = Object.keys(currentSettings);

    for (const key of Object.keys(settings)) {
      if (!validKeys.includes(key)) {
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      return of(false);
    }

    return this._backendService.sendAndWait<Responses.GenericUpdateSettings>('coreManager:settings', 'particl', true, settings ).pipe(
      map(resp => {
        if (
          Object.prototype.toString.call(resp) === '[object Object]'
          && resp.core === 'particl'
          && resp.request === 'update'
          && resp.hasError === false
          && resp.response === true
        ) {
          return true;
        }

        return false;
      }),
      catchError(() => of(false)),
      tap({
        next: success => {
          if (!success || !this.initialized) { return; }

          const existingSettings = this.settings$.value;
          for (const key of Object.keys(settings)) {
            existingSettings[key].value = settings[key];
          }
          this.settings$.next(existingSettings);
        }
      })
    );
  }


  private parseParticlSettings(data: Responses.ParticlSettings): Settings | null {
    if (
      Object.prototype.toString.call(data) === '[object Object]'
      && data.core === 'particl'
      && data.hasError === false
      && data.request === 'settings'
      && Object.prototype.toString.call(data.response) === '[object Object]'
      && Object.prototype.toString.call(data.response.schema) === '[object Object]'
      && Object.prototype.toString.call(data.response.values) === '[object Object]'
    ) {
      const extractedSettings = this.extractSettings(data.response.schema);

      for (const settingKey of Object.keys(extractedSettings)) {
        const keyParts = settingKey.split('.');
        let dataObj = data.response.values;

        for (let ii = 0; ii < keyParts.length; ii++) {
          const keyPart = keyParts[ii];
          if (keyPart.length === 0) {
            break;
          }

          if (ii === keyParts.length - 1) {
            if (typeof dataObj[keyPart] === typeof extractedSettings[settingKey].value) {
              extractedSettings[settingKey].value = dataObj[keyPart] as string | number | boolean | (string | number | boolean)[];
            }
          } else {
            if (Object.prototype.toString.call(dataObj[keyPart]) !== '[object Object]') {
              break;
            }
            dataObj = dataObj[keyPart] as JsonLike;
          }
        }

      }
      return extractedSettings;
    }

    return null;
  }


  private extractSettings(data: any, keyPath: string = ''): Settings {
    let extractedValues: Settings = {};

    if (Object.prototype.toString.call(data) !== '[object Object]') {
      return extractedValues;
    }

    for (const objKey of Object.keys(data)) {

      if (Object.prototype.toString.call(data[objKey]) !== '[object Object]') {
        continue;
      }

      const currentPath = keyPath.length > 0 ? `${keyPath}.${objKey}` : objKey;

      if (data[objKey].type === 'object') {
        extractedValues = {...extractedValues, ...this.extractSettings(data[objKey].properties, currentPath)};
        continue;
      }

      if (typeof data[objKey].type === 'string') {
        const propType = data[objKey].type === 'integer' ? 'number' : data[objKey].type;
        let foundvalue: any = undefined;
        if (typeof data[objKey].default === propType) {
          foundvalue = data[objKey].default;
        } else {
          switch (propType) {
            case 'number': foundvalue = 0; break;
            case 'string': foundvalue = ''; break;
            case 'boolean': foundvalue = false; break;
            case 'array': foundvalue = []; break;
          }
        }

        if (foundvalue !== undefined) {
          const newSetting: Setting<typeof foundvalue> = {
            value: foundvalue,
            constraints: {},
          };
          if (typeof data[objKey].minimum === typeof foundvalue) {
            newSetting.constraints.min = data[objKey].minimum;
          }
          if (typeof data[objKey].maximum === typeof foundvalue) {
            newSetting.constraints.max = data[objKey].maximum;
          }
          if (typeof data[objKey].pattern === typeof foundvalue) {
            newSetting.constraints.pattern = data[objKey].pattern;
          }

          extractedValues[currentPath] = newSetting;
        }
      }

    }
    return extractedValues;
  }

}
