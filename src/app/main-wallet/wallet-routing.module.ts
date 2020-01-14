import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WalletBaseComponent } from './base/wallet-base.component';


const routes: Routes = [
  {
    path: '',
    component: WalletBaseComponent,
    children: [
      {
        path: 'active',
        loadChildren: () => import('./active-wallet/active-wallet.module').then(m => m.ActiveWalletModule)
      },
      {
        path: 'selection',
        loadChildren: () => import('./wallet-selection/wallet-selection.module').then(m => m.WalletSelectionModule)
      },
      {
        path: 'create',
        loadChildren: () => import('./create/create-wallet.module').then(m => m.CreateWalletModule)
      },
      { path: '', redirectTo: 'active', pathMatch: 'full' }
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
export class WalletRoutingModule { }
