import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { map, filter, tap, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { GlobalActions } from 'app/core/app-global-state/app.actions';


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

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
  ) { }

  ngOnInit() {
    this._store.dispatch(new GlobalActions.Initialize());
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
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
