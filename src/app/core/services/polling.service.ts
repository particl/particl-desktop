import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { of, merge, concat, Subject } from 'rxjs';
import { mergeMap, catchError, tap, delay, repeat, takeUntil, take } from 'rxjs/operators';
import { RpcService } from './rpc.service';
import { AppData } from '../store/app.actions';
import { AppSettingsState } from '../store/appsettings.state';


interface IPoll {
  rpc: string;
  interval: number;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService implements OnDestroy {

  private log: any = Log.create('polling.service id:' + Math.floor((Math.random() * 1000) + 1));
  private started: boolean = false;
  private currentWallet: string = '';
  private unsubscribe$: Subject<any> = new Subject();

  private activities: IPoll[] = [
    {rpc: 'getwalletinfo', interval: 5000, action: 'SetActiveWalletInfo'},
    {rpc: 'getnetworkinfo', interval: 10000, action: 'SetNetworkInfo'}
  ]

  constructor(
    private _rpc: RpcService,
    private _store: Store
  ) { }


  ngOnDestroy() {
    this.started = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  start() {
    this.log.d('poll() called to start polling for data');
    if (this.started) {
      this.log.d('already polling... ignoring the additional request');
      return;
    }
    this.started = true;

    const obsList = [];

    this.activities.forEach(
      (activity) => {
        const newObs = of({}).pipe(
          mergeMap(_ =>
            this._rpc.call(this.currentWallet, activity.rpc).pipe(
              catchError(err => {
                this.log.er(`failed rpc call '${activity.rpc}' -> ${err}`);
                return of(null);
              })
            )
          ),
          tap(response => {
            if (response !== null) {
              this._store.dispatch( new AppData[activity.action](response));
            }
          }),
          delay(activity.interval),
          repeat()
        );

        obsList.push(newObs);
      }
    );

    obsList.push(
      this._store.select(AppSettingsState.activeWallet).pipe(
        tap(wallet => {
          this.currentWallet = wallet;
        })
      )
    );

    const outerObs = merge(...obsList);

    concat(
      this._store.select(AppSettingsState.activeWallet).pipe(
        take(1),
        tap(wallet => {
          this.currentWallet = wallet
        })
      ),

      outerObs
    ).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }
}
