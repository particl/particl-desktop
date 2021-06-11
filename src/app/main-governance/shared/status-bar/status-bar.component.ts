import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, defer, Subject, timer, combineLatest, of, iif } from 'rxjs';
import { takeUntil, distinctUntilChanged, map, switchMap, tap, startWith } from 'rxjs/operators';

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

  readonly canRefresh$: Observable<boolean>;
  readonly refreshCountdown$: Observable<string>;


  private destroy$: Subject<void> = new Subject();
  private performRefresh$: Observable<never>;
  private canRefreshControl: FormControl = new FormControl(false);

  constructor(
    private _store: Store,
    private _governService: GovernanceService,
  ) {

    // set up the observable for actually performing a refresh action
    this.performRefresh$ = defer(() => {
      this.canRefreshControl.setValue(false);
      this._governService.refreshProposals();
    });

    // determine if the refresh button is enabled or not
    this.canRefresh$ = combineLatest([
      this._store.select(GovernanceState.isBlocksSynced).pipe(distinctUntilChanged(), takeUntil(this.destroy$)),
      this.canRefreshControl.valueChanges.pipe(startWith(this.canRefreshControl.value), distinctUntilChanged(), takeUntil(this.destroy$)) as Observable<boolean>,
    ]).pipe(
      map(statuses => statuses[0] && statuses[1])
    );

    // set up countdown to when the next auto refresh is taking place
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
    // prevent timeout if a refresh was recently performed
    const msRefreshTimeout = 5 * 1000;
    this._store.select(GovernanceState.lastSyncTime).pipe(
      switchMap(updateTime => iif(
        () => (updateTime + msRefreshTimeout) <= Date.now(),
        defer(() => of(true)),
        defer(() => timer(msRefreshTimeout + 500).pipe(map(() => (updateTime + msRefreshTimeout) <= Date.now())))
      )),
      tap(value => {
        this.canRefreshControl.setValue(value)
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  refreshProposals() {
    this.performRefresh$.subscribe();
  }

}
