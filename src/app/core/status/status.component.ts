import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalsService } from '../../modals/modals.service';

import { PeerService } from '../rpc/peer.service';
import { RPCService } from '../rpc/rpc.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css'],
  providers: [
    PeerService
  ]
})
export class StatusComponent implements OnInit {

  private peerListCount: number = 0;
  private _subPeerList: Subscription;

  public encryptionStatus: string = 'Locked';

  constructor(private  _peerService: PeerService, private _rpc: RPCService, private modalsService: ModalsService) { }

  ngOnInit() {
    this._subPeerList = this._peerService.getPeerList()
      .subscribe(
        peerList => {
          this.peerListCount = peerList.length;
        },
        error => console.log('StatusComponent subscription error:' + error));

    this._rpc.register(this, 'getwalletinfo', null, this.rpc_walletEncryptionStatus, 'both');
  }

  getPeerListCount() {
    return this.peerListCount;
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

  // TODO: Status Interface
  rpc_walletEncryptionStatus(status: any) {
    this.encryptionStatus = status.encryptionstatus;
  }

  rpc_walletLock_success(json: Object) {

  }

  toggle() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call(this, 'walletlock', null, this.rpc_walletLock_success);
        break;
      case 'Locked':
        this.modalsService.open('unlock');
        break;
      default:
        break;
    }
  }
}
