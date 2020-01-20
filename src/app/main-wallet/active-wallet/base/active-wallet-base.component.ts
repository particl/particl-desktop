import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
  params?: any;
}

interface IMenuGroup {
  title: string;
  menuItems: IMenuItem[];
}


@Component({
  templateUrl: './active-wallet-base.component.html',
  styleUrls: ['./active-wallet-base.component.scss']
})
export class ActiveWalletBaseComponent {

  readonly menu: IMenuGroup[] = [
    {
      title: '',
      menuItems: [
        {text: 'Overview', path: '/main/wallet/active/overview', icon: 'part-overview'}
      ]
    },
    {
      title: 'Wallet',
      menuItems: [
        {text: 'Send / Convert', path: 'send', icon: 'part-send'},
        {text: 'Receive', path: 'receive', icon: 'part-receive'},
        {text: 'History', path: 'history', icon: 'part-date'},
        {text: 'Address Book', path: 'addressbook', icon: 'part-people'}
      ]
    },
    {
      title: '',
      menuItems: [
        {text: 'Wallet Settings', path: 'settings', icon: 'part-tool'}
      ]
    }
  ];

  @Select(CoreConnectionState.isTestnet) testnet: Observable<boolean>;

  constructor() { }
}
