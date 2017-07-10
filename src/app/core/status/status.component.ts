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

  private encryptionStatus: string = '_off';

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

  getIconNumber(): string {
    if (this.peerListCount <= 0) {
      return '0';
    } else if (this.peerListCount === 1) {
      return '1';
    } else if (this.peerListCount <= 3) {
      return '2';
    } else if (this.peerListCount === 4) {
      return '3';
    } else if (this.peerListCount <= 6) {
      return '4';
    } else if (this.peerListCount === 7) {
      return '5';
    } else if (this.peerListCount >= 8) {
      return '6';
    }
  }

  getIconLock(): string {
    return this.encryptionStatus;
  }

  rpc_walletEncryptionStatus(json: Object) {
    if (json['encryptionstatus'] === 'Unencrypted') {
      this.encryptionStatus = '_off'; // TODO: icon?
    } else if (json['encryptionstatus'] === 'Unlocked') {
      this.encryptionStatus = '_off';
    } else if (json['encryptionstatus'] === 'Unlocked, staking only') {
      this.encryptionStatus = '_stake';
    } else if (json['encryptionstatus'] === 'Locked') {
      this.encryptionStatus = '';
    }
  }

}
