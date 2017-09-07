import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { ModalsService } from '../../modals/modals.service';

import { PeerService, RPCService, BlockStatusService } from '../rpc/rpc.module';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit, OnDestroy {

  peerListCount: number = 0;

  public encryptionStatus: string = 'Locked';
  private _sub: Subscription;

  private log: any = Log.create('status.component');


  constructor(
    private _rpc: RPCService,
    private _modalsService: ModalsService) { }

  ngOnInit() {
    this._sub = this._rpc.chainState.skip(1)
      .subscribe(
        state => {
          this.encryptionStatus = state.chain.encryptionstatus,
          this.peerListCount = state.chain.connections
        },
        error => this.log.er(`getEncryptionStatus, subscription error: ${error}`));
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
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

  toggle() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':
        this._modalsService.open('encrypt', {'forceOpen': true});
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call('walletlock')
          .subscribe();
        break;
      case 'Locked':
        this._modalsService.open('unlock', {'timeout': 59, 'forceOpen': true});
        break;
      default:
        break;
    }
  }
}
