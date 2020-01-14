import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WalletSelectionComponent } from './wallet-selection/wallet-selection.component';


const routes: Routes = [
  {
    path: '', component: WalletSelectionComponent
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
