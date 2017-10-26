import { Component, OnInit } from '@angular/core';

import { StateService } from '../../../core/state/state.service';
import { ModalsService } from '../../../modals/modals.service';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  private coldStakingEnabled: boolean = undefined;

  constructor(
    private _state: StateService,
    private _modals: ModalsService,
    // private _rpc: RPCService
  ) {
    this._state.observe('coldstaking').subscribe(status => {this.coldStakingEnabled = status;     console.log(status); });
  }

  ngOnInit() {
  }

  isColdStakingEnabled() {
    return this.coldStakingEnabled;
  }

  openUnlockWalletModal() {
    this._modals.open('unlock', {forceOpen: true, showStakeOnly: false});
  }

  openColdStakeModal() {
    this._modals.open('coldStake', {forceOpen: true, type: 'cold'});
  }
}
