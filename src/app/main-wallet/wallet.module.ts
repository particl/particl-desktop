import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { WalletBaseComponent } from './base/wallet-base.component';
import { WalletGuardService } from './wallet-guard-service';
import { DeactivationRouteGuard } from './deactivation.guard';


const routes: Routes = [
  {
    path: '',
    component: WalletBaseComponent,
    children: [
      { path: 'active', loadChildren: () => import('./active/active-wallet.module').then(m => m.ActiveWalletModule) },
      { path: 'create', loadChildren: () => import('./create-wallet/create-wallet.module').then(m => m.CreateWalletModule) },
      { path: '**', redirectTo: 'active' },
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    MainSharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    WalletBaseComponent
  ],
  providers: [
    WalletGuardService,
    DeactivationRouteGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletModule { }
