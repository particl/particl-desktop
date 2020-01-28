import { Component, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';

import { Log } from 'ng2-logger';

import { AppDataState } from 'app/core/store/appdata.state';
import { Observable, Subject } from 'rxjs';
import { BlockSyncService } from './block-sync.service';


@Component({
  templateUrl: './block-sync-modal.component.html',
  styleUrls: ['./block-sync-modal.component.scss']
})
export class BlockSyncModalComponent implements OnDestroy {

  @Select(AppDataState.networkValue('connections')) totalConnections: Observable<number>;

  remainder: any;
  estimatedTimeLeft: string;
  syncPercentage: number;


  private log: any = Log.create('block-sync-modal.component');
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _blockSyncService: BlockSyncService,
  ) {

    this.log.d('component intializing');

    // TODO: IMPLEMENT THIS
    // this._blockSyncService.statusUpdates.asObservable().subscribe(status => {

    //   this.remainder = status.remainingBlocks < 0
    //     ? 'waiting for peers...'
    //     : status.remainingBlocks;

    //   this.estimatedTimeLeft = status.syncPercentage === 100
    //     ? 'DONE'
    //     : status.estimatedTimeLeft;

    //   this.syncPercentage = status.syncPercentage;

    // });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
