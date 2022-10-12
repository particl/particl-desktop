import { Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Particl } from 'app/networks/networks.module';


@Component({
  selector: 'main-layout-default',
  templateUrl: './main-layout-default.component.html',
  styleUrls: ['./main-layout-default.component.scss']
})
export class MainLayoutDefaultComponent {

  @Select(Particl.State.Blockchain.chainType) chainType: Observable<string>;

  constructor() { }
}
