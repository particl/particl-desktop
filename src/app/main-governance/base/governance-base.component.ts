import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {  } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { routeData } from '../governance.routing';
import { GovernanceService } from './governance.service';


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
export class GovernanceBaseComponent implements OnDestroy {

  readonly clientVersion: string = environment.governanceVersion || '';

  readonly menu: MenuItem[] = routeData.map(rd => ({text: rd.text, path: rd.path, icon: rd.icon}));

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _govService: GovernanceService
  ) {
    this._govService.startPolling();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByMenuFn(idx: number, item: MenuItem) {
    return idx;
  }
}
