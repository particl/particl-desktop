import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PeerService } from '../rpc/peer.service';
import { RPCService } from '../rpc/rpc.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  private peerListCount: number = 0;
  private _subPeerList: Subscription;

  public encryptionStatus: string = '_off';

  constructor(private  _peerService: PeerService, private _rpc: RPCService) { }

  ngOnInit() {
    this._subPeerList = this._peerService.getPeerList()
      .subscribe(
        peerList => {
          this.peerListCount = peerList.length;
        },
        error => console.log('StatusComponent subscription error:' + error));

    this._rpc.register(this, 'getwalletinfo', null, this.rpc_walletEncryptionStatus, 'both'); ;
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

  // TODO: Status Interface
  rpc_walletEncryptionStatus(status: any) {
    switch (status.encryptionstatus) {
      case 'Unencrypted':  // TODO: icon?
      case 'Unlocked':
        this.encryptionStatus = '_off';
        break;
      case 'Unlocked, staking only':
        this.encryptionStatus = '_stake';
        break;
      case 'Locked':
        this.encryptionStatus = '';
        break;
      default:
        this.encryptionStatus = '_off'; // TODO: icon?
    }
  }
}
