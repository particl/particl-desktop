import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { ModalsService } from '../../modals/modals.service';

import { PeerService, RPCService, BlockStatusService , EncryptionStatusService } from '../rpc/rpc.module';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit, OnDestroy {

  peerListCount: number = 0;
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
        peerList => this.peerListCount = peerList.length,
        error => this.log.er(`peerListCount, subscription error: ${error}`));

    this._subEncryptionStatus = this._encryptionStatusService.getEncryptionStatus()
      .subscribe(
        encryptionStatus => this.encryptionStatus = encryptionStatus,
        error => this.log.er(`getEncryptionStatus, subscription error: ${error}`));
  }

  ngOnDestroy() {
    if (this._subPeerList) {
      this._subPeerList.unsubscribe();
    }
    if (this._subEncryptionStatus) {
      this._subEncryptionStatus.unsubscribe();
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
        // TODO: Encrypt wallet modal...
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call('walletlock')
          .subscribe(_ => this._encryptionStatusService.refreshEncryptionStatus().subscribe());
        break;
      case 'Locked':
        this._modalsService.open('unlock');
        break;
      default:
        break;
    }
  }
}
