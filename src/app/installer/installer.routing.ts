import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstallerComponent } from './installer.component';
import { EncryptWalletComponent } from './encrypt-wallet/encrypt-wallet.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';

//   { path: '', redirectTo: '/wallet/overview', pathMatch: 'full' },
const routes: Routes = [
  {
    path: 'installer',
    component: InstallerComponent,
    children: [
      { path: '', redirectTo: 'encrypt', pathMatch: 'full' },
      { path: 'encrypt', component: EncryptWalletComponent },
      { path: 'create', component: CreateWalletComponent },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
