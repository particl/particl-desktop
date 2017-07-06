import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeerService } from '../../wallet/shared/peer.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-syncing',
  templateUrl: './syncing.component.html',
  styleUrls: ['./syncing.component.scss'],
  providers: [
    PeerService
  ]
})
export class SyncingComponent implements OnInit, OnDestroy {

  private highestBlockHeightNetwork: number = -1;
  private highestBlockHeightInternal: number = -1;

  private startingBlockCount: number = -1;
  private totalRemainder: number = -1;

  public remainingBlocks: number = 0;
  public lastBlockTime: Date = new Date();
  public increasePerMinute: number = 0;
  public estimatedTimeLeft: number = 0;

  private _subBlockInternal: Subscription;
  private _subBlockNetwork: Subscription;

  constructor(private peerService: PeerService) {
    console.log('syncing');
  }

  ngOnInit() {
    this._subBlockInternal = this.peerService.getBlockCount()
      .subscribe(
        height => {
          const lastBlockTime = new Date();
          this.calculateSyncingDetails(lastBlockTime, height);

          this.highestBlockHeightInternal = height;
          this.lastBlockTime = lastBlockTime;


          if (this.startingBlockCount === -1) {
            this.startingBlockCount = height;
          }

        },
        error => console.log('SyncingComponent subscription error:' + error));

    this._subBlockNetwork = this.peerService.getBlockCountNetwork()
      .subscribe(
        height => {

          this.highestBlockHeightNetwork = height;

          if (this.totalRemainder === -1) {
            this.totalRemainder = height - this.startingBlockCount;
          }

        },
        error => console.log('SyncingComponent subscription error:' + error));
  }

  ngOnDestroy() {
    this._subBlockInternal.unsubscribe();
    this._subBlockNetwork.unsubscribe();
  }

  calculateSyncingDetails(newTime: Date, newHeight: number) {
    if (this.highestBlockHeightInternal === -1 || this.totalRemainder <= 0) {
      return;
    }
    const timeDiff: number = newTime.getTime() - this.lastBlockTime.getTime();
    const blockDiff: number = newHeight - this.highestBlockHeightInternal;

    if (timeDiff > 0) {
      const increasePerMinute = blockDiff / this.totalRemainder * 100 * (60 * 1000 / timeDiff);

      if (increasePerMinute <= 100) {
        this.increasePerMinute = +increasePerMinute.toFixed(2);
      } else {
        this.increasePerMinute = 100;
      }
    }

    if (blockDiff > 0) {
      this.estimatedTimeLeft = Math.floor((this.getRemainder() / blockDiff * timeDiff) / 1000);
    }

  }

  getRemainder() {
    const diff = this.highestBlockHeightNetwork - this.highestBlockHeightInternal;
    return (diff < 0 ? 0 : diff);
  }

  //TODO: average out the estimated time left to stop random shifting when slowed down.
  getEstimateTimeLeft() {
    const secs = this.estimatedTimeLeft;
    const seconds = Math.floor(secs % 60);
    const minutes = Math.floor((secs / 60) % 60);
    const hours = Math.floor((secs / 3600) % 3600);

    let returnString = '';

    if (hours > 0) {
      returnString += hours + ' hour' + (hours > 1 ? 's' : '') + ' '
    }

    if (minutes > 0) {
      returnString += minutes + ' minute' + (minutes > 1 ? 's' : '') + ' '
    }

    if (seconds > 0) {
      returnString += seconds + ' second' + (seconds > 1 ? 's' : '') + ' '
    }

    if (returnString === '') {
      returnString = 'DONE';
    }
    return returnString;
  }




}
