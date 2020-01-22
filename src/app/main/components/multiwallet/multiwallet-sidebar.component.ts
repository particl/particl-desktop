import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { Log } from 'ng2-logger';
import { Subject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { APP_MODE } from 'app/core/store/app.models';
import { ApplicationState } from 'app/core/store/app.state';
import { WalletInfoState } from 'app/main/store/main.state';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnInit, OnDestroy {

  public selectedMode: APP_MODE;
  public pathIdx: number = 0;
  public activeWallet: string = '-';
  public SELECTED_MODE: typeof APP_MODE = APP_MODE;

  public paths: string[] = [
    'wallet/active',
    'wallet/selection',
    'market/active',
    'market/switcher',
    'market/manage'
  ];

  private log: any = Log.create(
    'multiwallet-sidebar.component id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.log.d('initializing');

    const wallet$ = this._store.select(
      WalletInfoState.getValue('walletname')
    ).pipe(
      tap((wName: string | null) => {
        if (wName === null) {
          this.activeWallet = '-';
        } else {
          this.activeWallet = wName === '' ? 'Default Wallet' : wName;
        }
      })
    );

    const mode$ = this._store.select(
      ApplicationState.appMode
    ).pipe(
      tap((mode) => {
          this.selectedMode = mode;
      })
    );

    merge(
      wallet$,
      mode$
    ).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  openConsoleWindow() {
    if (this.activeWallet !== '-') {
      this._dialog.open(ConsoleModalComponent);
    }
  }
}
