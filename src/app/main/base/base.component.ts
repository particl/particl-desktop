import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, fromEvent, merge } from 'rxjs';
import { map, filter, tap, takeUntil, auditTime } from 'rxjs/operators';
import { Log } from 'ng2-logger';
import { Store, Actions, ofActionDispatched, ofActionCompleted } from '@ngxs/store';
import { MainActions } from '../store/main.actions';
import { ZMQ } from 'app/core/store/app.actions';
import * as zmqOptions from '../../../../modules/zmq/services.js';


/*
 * The MainView is basically:
 * sidebar (optional) +
 * router-outlet
 *
 * Its primary purpose is a shell for rendering of the base main view options.
 */
@Component({
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  showAppSelector: boolean = true;

  private log: any = Log.create('main.component id: ' + Math.floor((Math.random() * 1000) + 1));
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _actions$: Actions
  ) {

    const blockWatcher$ = this._actions$.pipe(
      ofActionDispatched(ZMQ.UpdateStatus),
      filter((action: ZMQ.UpdateStatus) => action.field === 'hashtx'),
      auditTime(zmqOptions.throlledSeconds * 1000), // rate-limited to max every x seconds
      takeUntil(this.unsubscribe$)
    );

    const walletChanger$ = this._actions$.pipe(
      ofActionCompleted(MainActions.ChangeWallet),
      takeUntil(this.unsubscribe$)
    );

    const walletInit$ = this._actions$.pipe(
      ofActionCompleted(MainActions.Initialize),
      takeUntil(this.unsubscribe$)
    );

    // Create pipeline to update various additional necessary wallet details
    merge(
      blockWatcher$,
      walletChanger$,
      walletInit$
    ).pipe(
      auditTime(1000),
      takeUntil(this.unsubscribe$)
    ).subscribe(
      () => {
        this._store.dispatch(new MainActions.LoadWalletData());
      }
    );
  }

  ngOnInit() {
    this.log.d('Main.Component constructed');
    this._store.dispatch(new MainActions.Initialize(true));
  }


  ngAfterViewInit() {
    // @TODO zaSmilingIdiot 2020-02-28 -> is this really still necessary,
    //    particularly now that we have paste functionality on the Mac via the inclusion of the shortcut keys in Electron?
    // Paste Event Handle: using rxjs's fromEvent instead of HostListener
    // Prevents Angular change detection running for each event (whether the event handled or not) when using HostListener
    fromEvent(document, 'keydown').pipe(
      map((event: KeyboardEvent) => {
        if (event.metaKey && event.keyCode === 86 && navigator.platform.indexOf('Mac') > -1) {
          event.preventDefault();
          return true;
        }
        return false;
      }),
      filter(Boolean),
      tap(() => document.execCommand('Paste')),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
