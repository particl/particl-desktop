import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { termsObj } from 'app/startup/terms/terms-txt';

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {
  log: any = Log.create('loading.component');

  loadingMessage: Observable <string>;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _router: Router
  ) {
    this.log.i('loading component initialized');
    this.loadingMessage = this._store.select(state => state.global.loadingMessage);
  }

  ngOnInit() {
    this._store.select(state => state.global.isConnected).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      (isConnected: boolean) => {
        if (!isConnected) {
          return;
        }
        this.getNextRoute();
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getNextRoute() {
    const termsVersion = JSON.parse(localStorage.getItem('terms'));
    if (!termsVersion ||
        ((termsVersion.createdAt !== termsObj.createdAt) || (termsVersion.text !== termsObj.text))
    ) {
      this.goToTerms();
      return;
    }

    this._router.navigate(['/main/extra/help']);
  }

  private goToTerms() {
    this.log.d('Going to terms');
    this._router.navigate(['loading', 'terms']);
  }
}
