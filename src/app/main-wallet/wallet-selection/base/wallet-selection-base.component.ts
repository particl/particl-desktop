import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { MainActions } from 'app/main/store/main.actions';


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

  constructor(
    private _router: Router,
    private _store: Store
  ) { }


  navigateToWalletCreate() {
    this._store.dispatch(new MainActions.ResetWallet()).subscribe(
      () => {
        this._router.navigate(['/main/wallet/create/']);
      }
    )
  }
}
