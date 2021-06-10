import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, skipWhile, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { GovernanceState } from '../store/governance-store.state';

import { environment } from 'environments/environment';
import { routeData } from '../governance.routing';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { GovernanceService } from './governance.service';


enum TextContent {
  REFRESH_ERROR = 'Updating of the proposals failed'
}


interface MenuItem {
  text: string;
  path: string;
  icon?: string;
}


@Component({
  templateUrl: './governance-base.component.html',
  styleUrls: ['./governance-base.component.scss'],
  providers: [GovernanceService]
})
export class GovernanceBaseComponent {

  readonly clientVersion: string = environment.governanceVersion || '';
  readonly menu: MenuItem[] = routeData.map(rd => ({text: rd.text, path: rd.path, icon: rd.icon}));

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _store: Store,
    private _snackbar: SnackbarService,
    private _govService: GovernanceService
  ) {
    this._govService.startPolling();

    this._store.select(GovernanceState.requestDidError()).pipe(
      skipWhile(didError => !didError),
      tap(() => this._snackbar.open(TextContent.REFRESH_ERROR, 'warn')),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByMenuFn(idx: number, item: MenuItem) {
    return idx;
  }
}
