import { Component } from '@angular/core';

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
export class GovernanceBaseComponent {

  readonly clientVersion: string = environment.governanceVersion || '';
  readonly menu: MenuItem[] = routeData.map(rd => ({text: rd.text, path: rd.path, icon: rd.icon}));


  constructor(
    private _govService: GovernanceService
  ) {
    this._govService.startPolling();
  }


  trackByMenuFn(idx: number, item: MenuItem) {
    return idx;
  }
}
