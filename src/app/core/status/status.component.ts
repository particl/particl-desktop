import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { ModalsService } from '../../modals/modals.service';

import { PeerService, RPCService, BlockStatusService , EncryptionStatusService } from '../rpc/rpc.module';

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
  private _subEncryptionStatus: Subscription;

  private log: any = Log.create('status.component');


  constructor(
    private  _peerService: PeerService,
    private _encryptionStatusService: EncryptionStatusService,
    private _rpc: RPCService,
    private _modalsService: ModalsService,
    ) { }

  ngOnInit() {
    this._subPeerList = this._peerService.getPeerList()
      .subscribe(
        peerList => {
          this.peerListCount = peerList.length;
        },
        error => this.log.er(`peerListCount, subscription error: ${error}`));

    this._subEncryptionStatus = this._peerService.getEncryptionStatus()
      .subscribe(
        encryptionStatus => {
          this.encryptionStatus = encryptionStatus;
        },
        error => this.log.er(`getEncryptionStatus, subscription error: ${error}`));
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

  toggle() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call(this, 'walletlock', null, this.rpc_walletLock_success);
        break;
      case 'Locked':
        this._modalsService.open('unlock');
        break;
      default:
        break;
    }
  }

  rpc_walletLock_success(json: Object) {

  }
}
