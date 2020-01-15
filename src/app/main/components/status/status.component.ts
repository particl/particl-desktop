
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Subject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AppDataState } from 'app/core/store/appdata.state';


@Component({
  selector: 'main-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  peerListCount: number = 0;
  walletStatus: string = '-off';
  timeOffset: number = 0;

  private log: any = Log.create('status.component id:' + Math.floor(Math.random() * 1000 + 1));
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _store: Store
  ) { }

  ngOnInit() {
    this.log.d('initializing');

    merge(
      this._store.select(AppDataState.networkValue('connections')).pipe(
        tap((count) => {
          this.peerListCount = count;
        })
      ),

      this._store.select(AppDataState.networkValue('timeoffset')).pipe(
        tap((offset) => {
          this.timeOffset = offset;
        })
      ),

    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get peerIcon(): number {
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

  get walletStatusIcon(): string {
    // to be implemented
    return '-off';
  }

  openConsoleWindow() {
    // to be implemented
  }

  toggleWalletStatus() {
    // to be implemented
  }
}
