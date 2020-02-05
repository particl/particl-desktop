import { Component } from '@angular/core';


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
  params?: any;
}


@Component({
  templateUrl: './active-wallet-base.component.html',
  styleUrls: ['./active-wallet-base.component.scss']
})
export class ActiveWalletBaseComponent {

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview'},
    {text: 'Send / Convert', path: 'send', icon: 'part-send'},
    {text: 'Receive', path: 'receive', icon: 'part-receive'},
    {text: 'History', path: 'history', icon: 'part-date'},
    {text: 'Address Book', path: 'addressbook', icon: 'part-people'},
    {text: 'Wallet Settings', path: 'settings', icon: 'part-tool'}
  ];

  constructor() { }
}
