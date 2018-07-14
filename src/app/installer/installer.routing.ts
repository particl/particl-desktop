import { Component, OnInit } from '@angular/core';

import { TestComponent } from './test/test.component';
//import { EncryptWalletComponent } from './encrypt-wallet/encrypt-wallet.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';



@Component({
    template: `<router-outlet></router-outlet>`
})
export class InstallerRouterComponent { }
  


export const installer_routing =
  {
    path: 'installer',
    component: InstallerRouterComponent,
    children: [
      { path: '', redirectTo: 'test', pathMatch: 'full' },
      { path: 'test', component: TestComponent },
      { path: 'create', component: CreateWalletComponent },
    ]
  };



  