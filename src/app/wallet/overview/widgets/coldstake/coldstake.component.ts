import { Component, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../../core/rpc/rpc.module';
import { ModalsService } from '../../../modals/modals.service';

import { Amount } from '../../../shared/util/utils';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  /*  General   */
  private log: any = Log.create('coldstake.component');
  coldStakingEnabled: boolean = undefined;

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

  constructor(
    private _modals: ModalsService,
    private _rpc: RpcService
  ) {
    this._rpc.state.observe('ui:coldstaking')
    .subscribe(status => this.coldStakingEnabled = status);

    this.rpc_progressLoop();
  }

  ngOnInit() {
  }

  /** calls listunspent, then calculate progress. */
  private rpc_progressLoop() {

    if (this.coldStakingEnabled) {
      this._rpc.call('listunspent')
        .subscribe(
          (response: Array<any>) => {
            let activeCount = 0;
            let totalCount = 0;

            response.forEach((output) => {
              totalCount += output.amount;

              if (output.coldstaking_address !== undefined) {
                activeCount += output.amount;
              }
              this.log.d(`activeCount=${activeCount} totalCount=${totalCount}`);
              this.progress = new Amount((activeCount / totalCount) * 100, 2);
           });
         },
      // TODO: Handle error appropriately
      error => this.log.er('rpc_progressLoop: listunspent failed', error));
    }

    if (this.coldstakeProgress < 100) {
      setTimeout(this.rpc_progressLoop.bind(this), 1000);
    }
  }

  openUnlockWalletModal() {
    this._modals.open('unlock', {forceOpen: true, showStakeOnly: false});
  }

  openColdStakeModal() {
    this._modals.open('coldStake', {forceOpen: true, type: 'cold'});
  }
}
