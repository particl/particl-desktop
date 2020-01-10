import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Log } from 'ng2-logger';

import { DappRoutingModel } from 'app/main/main.models';


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
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.log.d('Main.Component constructed');

    this._route.data.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      (routeData: DappRoutingModel) => {
        this.showAppSelector = typeof routeData.showAppSelector === 'boolean' ? routeData.showAppSelector : true;
      }
    );
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
