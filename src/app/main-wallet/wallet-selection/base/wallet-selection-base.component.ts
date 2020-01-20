import { Component } from '@angular/core';


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
  templateUrl: './wallet-selection-base.component.html',
  styleUrls: ['./wallet-selection-base.component.scss']
})
export class WalletSelectionBaseComponent {

  readonly menu: IMenuGroup[] = [
    {
      title: '',
      menuItems: [
        {text: 'Select Wallet(s)', path: 'select', icon: 'part-overview'}
      ]
    }
  ];

  constructor() { }
}
