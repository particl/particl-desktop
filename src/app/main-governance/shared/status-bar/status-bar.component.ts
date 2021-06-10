import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, defer, Subject, timer, combineLatest } from 'rxjs';
import { takeUntil, distinctUntilChanged, tap, map } from 'rxjs/operators';

import { GovernanceState } from '../../store/governance-store.state';
import { GovernanceService } from '../../base/governance.service';
import { CHAIN_TYPE } from 'app/core/core.models';

@Component({
  selector: 'governance-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent implements OnInit, OnDestroy {

  @Select(GovernanceState.latestBlock) lastBlock: Observable<number>;
  @Select(GovernanceState.currentChain) network: Observable<CHAIN_TYPE | ''>;

  canRefresh: boolean = false;
  readonly refreshCountdown$: Observable<string>;


  private destroy$: Subject<void> = new Subject();
  private performRefresh$: Observable<never>;

  constructor(
    private _store: Store,
    private _governService: GovernanceService,
  ) {

    this.performRefresh$ = defer(() => {
      this.canRefresh = false;
      this._governService.refreshProposals();
    });


    this.refreshCountdown$ = combineLatest([
      timer(Date.now() % 1000, 1000).pipe(takeUntil(this.destroy$)),
      this._store.select(GovernanceState.lastSyncTime).pipe(takeUntil(this.destroy$)),
      this._store.select(GovernanceState.pollingStatus).pipe(takeUntil(this.destroy$)),
    ]).pipe(
      map(values => {
        if (!values[2] || +values[1] <= 0) {
          return 0;
        }
        const currentTime = Math.round(Date.now() / 1000);
        const expiryTime = Math.round((+values[1] + this._governService.AUTO_POLL_TIMEOUT) / 1000);
        const remainingSeconds = expiryTime - currentTime;

        if (remainingSeconds <= 0) {
          return 0;
        }
        return remainingSeconds;
      }),
      distinctUntilChanged(),
      map(secs => {
        let timestring = '';

        if (secs > 0) {
          // @TODO: zaSmilingIdiot 2021-06-10 -> Improve this type of crappy string building for translations
          const seconds = Math.floor(secs % 60),
                minutes = Math.floor((secs / 60) % 60);

          timestring = `${minutes.toString().padStart(2, '0')} m ${seconds.toString().padStart(2, '0')} s`;
        }
        return timestring;
      }),
      takeUntil(this.destroy$)
    );
  }


  ngOnInit() {
    this._store.select(GovernanceState.isBlocksSynced).pipe(
      distinctUntilChanged(),
      tap(isSynced => this.canRefresh = isSynced),
      takeUntil(this.destroy$)
    );

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  refreshProposals() {
    this.performRefresh$.subscribe();
  }

}
