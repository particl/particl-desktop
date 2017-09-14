// remove on
import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalsService } from '../modals.service';
import { BlockStatusService } from '../../core/rpc/blockstatus.service';
import { RPCService } from '../../core/rpc/rpc.service';

import { Log } from 'ng2-logger';

@Component({
  selector: 'app-syncing',
  templateUrl: './syncing.component.html',
  styleUrls: ['./syncing.component.scss']
})
export class SyncingComponent {

  log: any = Log.create('alertbox.component');

  remainder: any;
  lastBlockTime: Date;
  increasePerMinute: string;
  estimatedTimeLeft: string;
  manuallyOpened: boolean;
  syncPercentage: number;
  nPeers: number;

  constructor(
    private _blockStatusService: BlockStatusService,
    private _rpcService: RPCService
  ) {
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.nPeers = status.peerList ? status.peerList.length : 0;
      this.remainder = status.remainingBlocks < 0
        ? 'waiting for peers...'
        : status.remainingBlocks;
      this.lastBlockTime = status.lastBlockTime;
      this.increasePerMinute = status.syncPercentage === 100
        ? 'DONE'
        : status.syncPercentage.toFixed(2).toString() + ' %';
      this.estimatedTimeLeft = status.syncPercentage === 100
        ? 'DONE'
        : status.estimatedTimeLeft;
      this.manuallyOpened = status.manuallyOpened;
      this.syncPercentage = status.syncPercentage;
      if (status.syncPercentage === 100 && !this.manuallyOpened) {

        // BUG: this constructor is on a loop when we're syncing?
        // run particld with -reindex flag to trigger the bug
        this.log.d(`syncPercentage is 100%, closing automatically!`);

        // document.getElementById('close').click();
      }
    });
  }
}
