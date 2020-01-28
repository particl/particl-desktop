import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Select } from '@ngxs/store';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';

import { ZmqConnectionState } from 'app/core/store/zmq-connection.state';
import { BlockSyncModalComponent } from './block-sync-modal/block-sync-modal.component';
import { BlockSyncService } from './block-sync-modal/block-sync.service';



@Component({
  selector: 'block-sync-bar',
  templateUrl: './block-sync-indicator.component.html',
  styleUrls: ['./block-sync-indicator.component.scss'],
  providers: [ BlockSyncService ]
})
export class BlockSyncIndicatorComponent implements OnInit, OnDestroy {

  @Select(ZmqConnectionState.getData('hashtx')) blockWatcher$: Observable<string>;

  isSyncing: boolean = false;

  private log: any = Log.create('block-sync-bar.component');
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _dialog: MatDialog
  ) {
    this.log.d('initializing component');
  }


  ngOnInit(): void {
    this.blockWatcher$.pipe(
      tap(() => {
        this.isSyncing = true;
      }),
      switchMap(() => {
        // If the timeout has been executed 2s since the last zmqupdate msg was received,
        //  then set isLoading to false (sync is likely over).
        return timer(2000).pipe(
          tap(() => {
              this.isSyncing = false;
          })
        )
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openSyncingModal() {
    this._dialog.open(BlockSyncModalComponent, {
      disableClose: true
    });
  }
}
