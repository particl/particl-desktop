import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { MainActions } from '../store/main.actions';


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
export class BaseComponent implements OnInit, OnDestroy {

  showAppSelector: boolean = true;

  private log: any = Log.create('main.component id: ' + Math.floor((Math.random() * 1000) + 1));
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private _store: Store
  ) { }

  ngOnInit() {
    this.log.d('Main.Component constructed');
    this._store.dispatch(new MainActions.Initialize(true));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Paste Event Handle
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.metaKey && event.keyCode === 86 && navigator.platform.indexOf('Mac') > -1) {
      document.execCommand('Paste');
      event.preventDefault();
    }
  }
}
