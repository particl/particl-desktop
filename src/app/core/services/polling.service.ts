import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { of, merge, interval, timer, Subject, Observable, concat } from 'rxjs';
import { mergeMap, catchError, tap, delay, repeat, takeUntil, concatMap, retryWhen, delayWhen, take } from 'rxjs/operators';
import { environment } from 'environments/environment';

import { RpcService } from './rpc.service';
import { AppData } from '../store/app.actions';


interface IPoll {
  rpc: string;
  interval: number;
  action: string;
}

interface ClientVersionRelease {
  tag_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService implements OnDestroy {

  private log: any = Log.create('polling.service id:' + Math.floor((Math.random() * 1000) + 1));
  private started: boolean = false;
  private currentWallet: string = '';
  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private _rpc: RpcService,
    private _http: HttpClient,
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

    const rpcObs = this.getRpcPolling();
    const versionOb = this.getAppVersionPolling();

    merge(...rpcObs, versionOb).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  private getRpcPolling(): Observable<any>[] {

    const rpcActivities: IPoll[] = [
      { rpc: 'getnetworkinfo', interval: 10000, action: 'SetNetworkInfo' },
      { rpc: 'getpeerinfo', interval: 10000, action: 'SetPeerInfo' },
      { rpc: 'getblockcount', interval: 5000, action: 'SetNodeCurrentBlockheight' },
    ];

    const obsList: Observable<any>[] = [];
    rpcActivities.forEach((activity) => {
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
    });

    return obsList;
  }

  private getAppVersionPolling(): Observable<any> {
    let retryTimer = 1000;

    const request$ = this._http.get(environment.releasesUrl).pipe(
      retryWhen (
        errors => errors.pipe(
          delayWhen(() => {
            const existingValue = retryTimer;
            retryTimer = Math.round(retryTimer + (retryTimer / 2));
            return timer(existingValue);
          }),
        )
      ),
      tap((response: ClientVersionRelease) => {
        retryTimer = 1000;
        if (response && typeof response.tag_name === 'string') {
          this._store.dispatch( new AppData.SetVersionInfo({latestClient: response.tag_name}));
        }
      })
    );

    // Make initial request, then on success, poll every 30 minutes
    return concat(
      request$.pipe(take(1)),
      interval(1800000).pipe(
        concatMap(() => request$)
      )
    );
  }
}
