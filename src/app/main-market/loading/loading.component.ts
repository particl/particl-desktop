import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MarketActions } from '../store/market.actions';
import { StartedStatus } from '../store/market.models';


@Component({
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements OnInit, OnDestroy {


  private destroy$: Subject<void> = new Subject();
  private readonly defaultStartPath: string = 'overview';
  private readonly defaultFailurePath: string = 'settings';

  private redirectPath: string = '';

  constructor(
    private _store: Store,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    const paramsSnapshot = this._route.snapshot.queryParams;

    // see market start guard service for param field
    if ((typeof paramsSnapshot['redirectpath'] === 'string') && (paramsSnapshot['redirectpath'].length > 0)) {
      this.redirectPath = paramsSnapshot['redirectpath'];
    }
  }


  ngOnInit() {
    const started$ = this._store.select(MarketState.startedStatus).pipe(
      tap(status => {

        if (status === StartedStatus.STARTED) {
          if (this.redirectPath) {
            this._router.navigate([this.redirectPath]);
            this.redirectPath = '';
          } else {
            this._router.navigate([this.defaultStartPath], {relativeTo: this._route});
          }
          return;
        } else if (status !== StartedStatus.PENDING) {
          this._router.navigate([this.defaultFailurePath], {relativeTo: this._route});
          return;
        }
      }),
      takeUntil(this.destroy$)
    );

    merge(
      this._store.dispatch(new MarketActions.StartMarketService()),
      started$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
