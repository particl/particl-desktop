import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Select } from '@ngxs/store';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, switchMap, tap, skip } from 'rxjs/operators';

import { Particl } from 'app/networks/networks.module';
import { BlockSyncModalComponent } from './block-sync-modal/block-sync-modal.component';


@Component({
  selector: 'block-sync-bar',
  templateUrl: './block-sync-indicator.component.html',
  styleUrls: ['./block-sync-indicator.component.scss'],
})
export class BlockSyncIndicatorComponent implements OnInit, OnDestroy {

  @Select(Particl.State.ZMQ.getData('hashtx')) blockWatcher$: Observable<string>;

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
      skip(1),
      switchMap(() => {
        this.isSyncing = true;
        // If the timeout has been executed (2.5s since the last zmqupdate msg was received),
        //  then set isLoading to false as the sync is likely over (single block received).
        return timer(2_500).pipe(
          tap(() => {
              this.isSyncing = false;
          })
        );
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
