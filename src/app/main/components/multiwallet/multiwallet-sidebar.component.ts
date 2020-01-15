import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Log } from 'ng2-logger';
import { Subject, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { APP_MODE } from 'app/core/store/app.models';
import { ApplicationState } from 'app/core/store/app.state';
import { AppSettingsState } from 'app/core/store/appsettings.state';


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
    private _store: Store
  ) { }

  ngOnInit() {
    this.log.d('initializing');

    const obsList = [];

    obsList.push(
      this._store.select(
        AppSettingsState.activeWallet
      ).pipe(
        tap((wName) => {
          this.activeWallet = wName === '' ? 'Default' : wName;
        })
      )
    );

    obsList.push(
      this._store.select(
        ApplicationState.appMode
      ).pipe(
        tap((mode) => {
            this.selectedMode = mode;
        })
      )
    );

    merge(...obsList).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
