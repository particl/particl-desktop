import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { RpcStateService, BlockStatusService } from '../../core/core.module';

import { Log } from 'ng2-logger';

@Component({
  selector: 'app-syncing',
  templateUrl: './syncing.component.html',
  styleUrls: ['./syncing.component.scss']
})
export class SyncingComponent implements OnDestroy {

  log: any = Log.create('syncing.component');
  private destroyed: boolean = false;

  remainder: any;
  lastBlockTime: Date;
  increasePerMinute: string;
  estimatedTimeLeft: string;
  manuallyOpened: boolean;
  syncPercentage: number;
  nPeers: number;

  /* modal stuff */
  alreadyClosedOnce: boolean = false;


  constructor(
    private _blockStatusService: BlockStatusService,
    private _rpcState: RpcStateService,
    public _dialogRef: MatDialogRef<SyncingComponent>
  ) {
    _rpcState.observe('getnetworkinfo', 'connections')
      .takeWhile(() => !this.destroyed)
      .subscribe(connections => this.nPeers = connections);

    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {

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
        this.closeOnceHackishly();
      }
    });
  }

  closeOnceHackishly() {
    if (!this.alreadyClosedOnce) {
        // BUG: this constructor is on a loop when we're syncing?
        // run particld with -reindex flag to trigger the bug
        this.log.d(`syncPercentage is 100%, closing automatically!`);
        this.close();
        this.alreadyClosedOnce = true;
      }
  }

  close() {
    this._dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
