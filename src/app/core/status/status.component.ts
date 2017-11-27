import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { ModalsService } from '../../modals/modals.service';
import { StateService } from '../state/state.service';

import { RPCService } from '../rpc/rpc.module';
import { MdDialog} from '@angular/material';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  peerListCount: number = 0;
  public coldStakingStatus: boolean;
  public encryptionStatus: string = 'Locked';
  private _sub: Subscription;

  private log: any = Log.create('status.component');


  constructor(
    private _rpc: RPCService,
    private _modalsService: ModalsService,
    private _stateService: StateService) { }

  ngOnInit() {
    this._rpc.state.observe('connections')
      .subscribe(connections => this.peerListCount = connections);

    this._rpc.state.observe('encryptionstatus')
      .subscribe(status => this.encryptionStatus = status);

    this._rpc.state.observe('ui:coldstaking')
      .subscribe(status => this.coldStakingStatus = status);
  }

  getIconNumber(): number {
    switch (true) {
      case this.peerListCount <= 0: return 0;
      case this.peerListCount < 4: return 2;
      case this.peerListCount < 8: return 3;
      case this.peerListCount < 12: return 4;
      case this.peerListCount < 16: return 5;
      case this.peerListCount >= 16: return 6;
      default: return 0;
    }
  }

  getIconEncryption() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':  // TODO: icon?
      case 'Unlocked':
        return '_off';
      case 'Unlocked, staking only':
        return '_stake';
      case 'Locked':
        return '';
      default:
        return '_off'; // TODO: icon?
    }
  }

  getColdStakingStatus() {
    return (this.coldStakingStatus) ? 'enabled' : 'disabled';
  }

  toggle() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':
        this._modalsService.open('encrypt', {'forceOpen': true});
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call('walletlock')
          .subscribe(
            success => this._rpc.stateCall('getwalletinfo'),
            error => this.log.er('walletlock error'));
        break;
      case 'Locked':
        this._modalsService.open('unlock', {forceOpen: true, showStakeOnly: true});
        break;
      default:
        break;
    }
  }
}
