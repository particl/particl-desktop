import { Component } from '@angular/core';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../../../core/rpc/rpc.service';

@Component({
  selector: 'app-zap-walletsettings',
  templateUrl: './zap-walletsettings.component.html',
  styleUrls: ['./zap-walletsettings.component.scss']
})
export class ZapWalletsettingsComponent {

  private log: any = Log.create('zap-walletsettings');

  fee: number = 42;

  constructor(private _rpc: RpcService) {
  }

  zap(amount: number, script: any) {

    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: 'script',
      amount: amount,
      script: script /* TODO : remove optional args */
    }], 'coldstaking zap', '', 4, 64, false]).subscribe(info => {

      this.log.d('zap sendtypeto', info);

    });

  }

}
