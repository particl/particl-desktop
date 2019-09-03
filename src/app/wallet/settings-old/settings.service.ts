import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {

  needsUpdate: boolean = false;

  defaultSettings: Object = {
    main: {
      autostart: false,
      detachDatabases: true,
      feeAmount: 0.01,
      feeCurrency: 'part',
      stake: true,
      reserveAmount: 0,
      reservceCurrency: 'part',
      stakeInterval: 30,
      minRing: 3,
      maxRing: 100,
      autoRing: false,
      secureMessaging: false,
      thin: false,
      thinFullIndex: false,
      thinIndexWindow: 4096
    },
    network: {
      upnp: false,
      proxy: false,
      proxyIP: '127.0.0.1',
      proxyPort: 9050,
      socketVersion: 5
    },
    window: {
      tray: false,
      minimize: true
    },
    display: {
      language: 'default',
      units: 'part',
      rows: 20,
      addresses: true,
      notify: {
        message: true,
        sentTo: false,
        receivedWith: false,
        receivedFrom: false,
        selfPayment: false,
        partReceived: true,
        partSent: false,
        other: false
      },
      show: {
        sentTo: true,
        receivedWith: true,
        receivedFrom: true,
        selfPayment: true,
        partReceived: true,
        partSent: true,
        other: true
      }
    },
    i2p: {},
    tor: {}
  };

  loadSettings(): Object {
    return (JSON.parse(localStorage.getItem('settings')));
  }

  applySettings(settings: Object): void {

    const oldSettings: string = localStorage.getItem('settings');
    const newSettings: string = JSON.stringify(settings);

    localStorage.setItem('settings', newSettings);

    if (oldSettings !== newSettings) {
      this.needsUpdate = true;
    }
  }
}
