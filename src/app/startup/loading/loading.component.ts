import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { termsObj } from 'app/startup/terms/terms-txt';
import { AppStateModel, APP_MODE } from 'app/core/store/app.models';

@Component({
  selector: 'app-loading',
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
    )
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getNextRoute() {
    const termsVersion = JSON.parse(localStorage.getItem('terms'));
    if (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
      && termsVersion.text !== termsObj.text)) {
      this.goToTerms();
      return;
    }

    this._router.navigate(['/main/extra/help']);

    // const mode = this._store.selectSnapshot(state => (<AppStateModel>state.global).appMode);
    // switch (mode) {
    //   case APP_MODE.MARKET:
    //     this.goToMarket();
    //     break;
    //   default:
    //     this.goToWallet();
    // }
  }

  private goToTerms() {
    this.log.d('Going to terms');
    this._router.navigate(['loading', 'terms']);
  }

  private goToMarket() {
    this.log.d('Going to terms');
    this._router.navigate(['/main/market']);
  }

  private goToWallet() {
    this.log.d('Going to terms');
    this._router.navigate(['/main/wallet']);
  }

}
