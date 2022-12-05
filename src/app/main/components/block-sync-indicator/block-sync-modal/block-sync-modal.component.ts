import { Component, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, Subject, timer, merge, combineLatest } from 'rxjs';
import { auditTime, concatMap, takeUntil, map } from 'rxjs/operators';

import { Select, Store } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';


enum TextContent {
  BLOCK_CHECK = 'Calculating…',
  SYNC_COMPLETE = 'Done',
}


interface PeerCalculatedStats {
  remainingBlocks: number;
  highestPeerBlock: number;
  currentBlock: number;
  syncPercentage: number;
}


@Component({
  templateUrl: './block-sync-modal.component.html',
  styleUrls: ['./block-sync-modal.component.scss'],
})
export class BlockSyncModalComponent implements OnInit, OnDestroy {

  @Select(Particl.State.Blockchain.networkValue('connections')) totalConnections: Observable<number>;
  @Select(Particl.State.ZMQ.getData('hashtx')) blockWatcher$: Observable<string>;

  remainderBlocks: string = TextContent.BLOCK_CHECK;
  currentBlock: number = 0;
  totalBlocks: number = 0;
  lastUpdatedTime: number = Date.now();
  estimatedTimeLeft: string = '';
  syncComplete: boolean = false;
  syncPercentage: string = TextContent.BLOCK_CHECK;


  private log: any = Log.create('block-sync-modal.component');
  private destroy$: Subject<void> = new Subject();
  private arrayLastEstimatedTimeLefts: number[] = [];


  constructor(
    private _store: Store
  ) {
    this.log.d('component intializing');
  }


  ngOnInit() {

    const calculateStats$ = combineLatest([
      this._store.select(Particl.State.Blockchain.highestPeerBlockCount()).pipe(takeUntil(this.destroy$)),
      this._store.select(Particl.State.Blockchain.blockHeight).pipe(takeUntil(this.destroy$))
    ]).pipe(
      map(results => {
        const highestPeerBlock = results[0];
        const currentBlock = results[1];

        const remainingBlocks = highestPeerBlock - currentBlock;

        let syncPercentage = -1;
        if (highestPeerBlock > 0) {
          syncPercentage = Math.min((currentBlock / highestPeerBlock * 100), 100);
        }

        const stats: PeerCalculatedStats = {
          remainingBlocks,
          highestPeerBlock,
          syncPercentage,
          currentBlock
        };

        return stats;
      }),
      takeUntil(this.destroy$)
    );

    merge(
      this.blockWatcher$.pipe(takeUntil(this.destroy$)),
      timer(0, 10_000).pipe(takeUntil(this.destroy$))
    ).pipe(
      auditTime(2_000),  // do a new check every this many (milli-)seconds
      concatMap(() => calculateStats$),
      takeUntil(this.destroy$)
    ).subscribe(
      this.processStats.bind(this),
      this.handleError.bind(this)
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private processStats(stats: PeerCalculatedStats) {
    this.syncComplete = stats.syncPercentage > -1 ? (stats.remainingBlocks <= 0) : false;

    if (this.syncComplete) {
      this.remainderBlocks = TextContent.SYNC_COMPLETE;
      this.estimatedTimeLeft = TextContent.SYNC_COMPLETE;
    } else if (stats.remainingBlocks > 0) {
      this.remainderBlocks = `${stats.remainingBlocks}`;
    }

    this.syncPercentage = stats.highestPeerBlock > 0 ? stats.syncPercentage.toPrecision(4) : TextContent.BLOCK_CHECK;
    this.totalBlocks = stats.highestPeerBlock;

    const timeDiff = Date.now() - this.lastUpdatedTime;
    this.lastUpdatedTime = Date.now();

    if (this.syncComplete) {
      return;
    }

    const blockDiff: number = stats.currentBlock - this.currentBlock;

    if (blockDiff > 0) {
      // Calculate estimated remaining time
      // @TODO: zaSmilingIdiot 2020-01-29 -> Does the conditional to check for a block diff not skew the results over time?? Fix this...
      this.currentBlock = stats.currentBlock;

      const secs = this.exponentialMovingAverageTimeLeft(
        Math.floor(((stats.remainingBlocks > 0 ? stats.remainingBlocks : 0) / blockDiff * timeDiff) / 1000)
      );

      this.estimatedTimeLeft = this.formatSeconds(secs);
    }
  }


  /** Inserts estimatedTimeLeft into private array and returns an exponential moving average result to create more consistent result. */
  private exponentialMovingAverageTimeLeft(estimatedTimeLeft: number): number {
    // @TODO: zaSmilingIdiot 2020-01-29 -> This doesn't appear to do what it claims to do. Perhaps needs a review

    /* add element to averaging array */
    const length = this.arrayLastEstimatedTimeLefts.push(estimatedTimeLeft);

    // if length > allowed length, pop first element. Only keeps this many historical values
    if (length > 100) {
      this.arrayLastEstimatedTimeLefts.shift();
    }

    // smooth factor k = 2 / (N -1) where N > 1
    const k = 2 / (length - ( length > 1 ? 1 : 0));

    let EMA = 0;
    // EMA = array[i] * K + EMA(previous) * (1 - K)
    this.arrayLastEstimatedTimeLefts.forEach((time: number) => {
      EMA = time * k + EMA * (1 - k);
    });

    const averageEstimatedTimeLeft = Math.floor(EMA);

    return averageEstimatedTimeLeft;
  }


  private formatSeconds(sec: number) {
    // @TODO: zaSmilingIdiot 2020-01-29 -> Improve this type of crappy string building for translations
    const seconds = Math.floor(sec % 60),
          minutes = Math.floor((sec / 60) % 60),
          hours = Math.floor((sec / 3600) % 3600);

    let returnString = '';
    if (hours > 0) {
      returnString += `${hours} ${hours > 1 ? 'hours' : 'hour'} `;
    }
    if (minutes > 0) {
      returnString += `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} `;
    } else if (hours === 0 && seconds > 0) {
      returnString += `Any minute now!`;
    }

    if (returnString === '') {
      returnString = '∞';
    }
    return returnString;
  }


  private handleError(err: any) {
    this.log.er('Failed to fetch syncing data: ', err);
    this.remainderBlocks = TextContent.BLOCK_CHECK;
  }
}
