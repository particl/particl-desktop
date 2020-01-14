import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';


@Component({
  templateUrl: './active-wallet-base.component.html',
  styleUrls: ['./active-wallet-base.component.scss']
})
export class ActiveWalletBaseComponent {

  @Select(CoreConnectionState.isTestnet) testnet: Observable<boolean>;

  constructor() { }
}
