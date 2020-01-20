import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WalletSelectionBaseComponent } from './base/wallet-selection-base.component';
import { WalletSelectComponent } from './wallet-select/wallet-select.component';



const routes: Routes = [
  {
    path: '', component: WalletSelectionBaseComponent,
    children: [
      { path: 'select', component: WalletSelectComponent, data: { title: 'Select A Wallet'} },
      { path: '', redirectTo: 'select', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class WalletSelectionRoutingModule { }
