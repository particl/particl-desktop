import { Component, OnInit } from '@angular/core';

// import { EncryptWalletComponent } from './encrypt-wallet/encrypt-wallet.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';

@Component({
  templateUrl: './installer.router.html',
  styleUrls: ['./installer.router.scss']
})
export class InstallerRouterComponent { }

export const installer_routing = {
  path: 'installer',
  component: InstallerRouterComponent,
  children: [
    { path: '', redirectTo: 'create', pathMatch: 'full' },
    { path: 'create', component: CreateWalletComponent },
  ]
};
