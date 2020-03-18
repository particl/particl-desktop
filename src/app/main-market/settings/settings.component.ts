import { Component, OnDestroy } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { StartedStatus } from '../store/market.models';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { MarketActions } from '../store/market.actions';


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class MarketSettingsComponent implements OnDestroy {

  startedStatus: StartedStatus;
  StartedStatus: typeof StartedStatus = StartedStatus;


  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store
  ) {
    this._store.select(MarketState.startedStatus).pipe(
      tap((status) => this.startedStatus = status),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  restartMarketplace() {
    this._store.dispatch(new MarketActions.StartMarketService());
  }
}
