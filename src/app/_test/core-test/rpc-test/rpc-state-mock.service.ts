import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class RpcStateServiceMock {

  private responses: any = {
    getwalletinfo: {
      'walletname': '',
      'walletversion': 169900,
      'total_balance': 10.00000000,
      'balance': 6.00000000,
      'blind_balance': 4.00000000,
      'anon_balance': 0.00000000,
      'staked_balance': 0.00000000,
      'unconfirmed_balance': 0.00000000,
      'unconfirmed_blind': 0.00000000,
      'unconfirmed_anon': 0.00000000,
      'immature_balance': 0.00000000,
      'txcount': 5,
      'reserve': 0.00000000,
      'encryptionstatus': 'Locked',
      'unlocked_until': 0,
      'paytxfee': 0.00000000,
      'hdseedid': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'private_keys_enabled': true
    },
    getblockchaininfo: {
      'chain': 'test'
    },
    listunspent: [
      {
        coldstaking_address: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        address: '',
        confirmations: 5,
        amount: 0.5
      },
      {
        coldstaking_address: '',
        address: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        confirmations: 2,
        amount: 0.5
      },
      {
        coldstaking_address: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        address: '',
        confirmations: 0,
        amount: 1.2
      },
      {
        coldstaking_address: '',
        address: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        confirmations: 0,
        amount: 1.5
      },
      {
        coldstaking_address: '',
        address: 'xxxxxxxxxxxxxxxxxxxxxxxx',
        confirmations: 3,
        amount: 0.3
      },
    ]
  }

  constructor() { }

  observe(method: string, params?: Array<any> | null): Observable<any> {
    return Observable.create(observer => {
      observer.next(this.getResponse(method));
      observer.complete();
    });
  }

  get(method: string): any {
    return this.getResponse(method);
  }

  private getResponse(method: string) {
    const resp = this.responses[method];
    if (!resp) {
      return true;
    }
    return resp;
  }

}
