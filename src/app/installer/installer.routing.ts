import { ModuleWithProviders } from '@angular/core';

import { InstallerRouterComponent } from './installer.component';
import { TestComponent } from './test/test.component';
//import { EncryptWalletComponent } from './encrypt-wallet/encrypt-wallet.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';


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
