import { Injectable, Injector } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { StateService } from '../state/state.service';
import { PeerService } from './peer.service';

@Injectable()
export class BlockStatusService {

  private highestBlockHeightNetwork: number = -1;
  private highestBlockHeightInternal: number = -1;
  private startingBlockCount: number = -1;
  private totalRemainder: number = -1;

  public statusUpdates: Subject<any> = new Subject<any>();

  private status: any = {
    syncPercentage: 0,
    remainingBlocks: undefined,
    lastBlockTime: undefined,
    increasePerMinute: 0,
    estimatedTimeLeft: undefined,
    manuallyOpened: false,
    networkBH: -1,
    internalBH: -1
  };

  constructor(
    private _peerService: PeerService,
    private _state: StateService
  ) {
    // Get internal block height and calculate syncing details (ETA)
    this._state.observe('blocks')
      .subscribe(
        height => {
          const lastBlockTime = new Date(this._state.get('mediantime'));
          this.calculateSyncingDetails(lastBlockTime, height);
          this.highestBlockHeightInternal = height;
          this.status.internalBH = height;
          this.status.lastBlockTime = lastBlockTime;
          if (this.startingBlockCount === -1) {
            this.startingBlockCount = height;
          }
        },
        error => console.log('SyncingComponent subscription error:' + error));

    // Get heighest block count of peers and calculate remainerders.
    this._peerService.getBlockCountNetwork()
      .subscribe(
        height => {
          this.highestBlockHeightNetwork = height;
          this.status.networkBH = height;
          if (this.totalRemainder === -1 && this.startingBlockCount !== -1) {
            this.totalRemainder = height - this.startingBlockCount;
          }
        },
        error => console.log('SyncingComponent subscription error:' + error));
  }


  /** Calculates the details (percentage of synchronised, estimated time left, ..) */
  private calculateSyncingDetails(newTime: Date, newHeight: number) {

    const internalBH = this.highestBlockHeightInternal;
    const networkBH = this.highestBlockHeightNetwork;

    if (internalBH < 0 || networkBH < 0) {
      this.status.syncPercentage = 0;
      return;
    }

    // remainingBlocks
    this.status.remainingBlocks = networkBH - internalBH;

    // syncPercentage
    this.status.syncPercentage = internalBH / networkBH * 100;
    if (this.status.syncPercentage > 100) {
      this.status.syncPercentage = 100;
    }

    const timeDiff: number = newTime.getTime() - this.status.lastBlockTime.getTime();
    const blockDiff: number = newHeight - this.highestBlockHeightInternal;

    // increasePerMinute
    if (timeDiff > 0 && this.totalRemainder > 0) {
      const increasePerMinute = blockDiff / this.totalRemainder * 100 * (60 * 1000 / timeDiff);
      if (increasePerMinute < 100) {
        this.status.increasePerMinute = +increasePerMinute.toFixed(2);
      } else {
        this.status.increasePerMinute = 100;
      }
    }

    // timeLeft
    if (blockDiff > 0) {
      this.estimateTimeLeft(blockDiff, timeDiff);
    }

    // update
    this.statusUpdates.next(this.status);
  }

  /** Returns how many blocks remain to be synced. */
  private getRemainder() {
    const diff = this.highestBlockHeightNetwork - this.highestBlockHeightInternal;
    return (diff < 0 ? 0 : diff);
  }

  // TODO: average out the estimated time left to stop random shifting when slowed down.
  // and localize

  /** Calculates how much time is left to be fully synchronised. */
  private estimateTimeLeft(blockDiff: number, timeDiff: number) {

    let returnString = '';

    const secs = Math.floor((this.getRemainder() / blockDiff * timeDiff) / 1000),
          seconds = Math.floor(secs % 60),
          minutes = Math.floor((secs / 60) % 60),
          hours = Math.floor((secs / 3600) % 3600);

    if (hours > 0) {
      returnString += `${hours} ${hours > 1 ? 'hours' : 'hour'} `
    }
    if (minutes > 0) {
      returnString += `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} `
    }
    if (seconds > 0) {
      returnString += `${seconds} ${seconds > 1 ? 'seconds' : 'second'}`
    }
    if (returnString === '') {
      returnString = '∞';
    }

    this.status.estimatedTimeLeft = returnString;
  }
}
