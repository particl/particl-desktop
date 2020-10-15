import { Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';


@Component({
  selector: 'main-layout-default',
  templateUrl: './main-layout-default.component.html',
  styleUrls: ['./main-layout-default.component.scss']
})
export class MainLayoutDefaultComponent {

  @Select(CoreConnectionState.isTestnet) testnet: Observable<boolean>;

  constructor() { }
}
