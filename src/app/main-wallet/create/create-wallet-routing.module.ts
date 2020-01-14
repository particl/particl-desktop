import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateWalletComponent } from './create-wallet/create-wallet.component';


const routes: Routes = [
  {
    path: '', component: CreateWalletComponent
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
export class CreateWalletRoutingModule { }
