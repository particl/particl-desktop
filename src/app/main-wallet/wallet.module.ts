import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { QRCodeModule } from 'angularx-qrcode';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { WalletBaseComponent } from './base/wallet-base.component';
import { WalletLoadingPlaceholderComponent } from './base/wallet-loading-placeholder/wallet-loading-placeholder.component';
import { WalletGuardService } from './wallet-guard-service';


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
    ClipboardModule,
    QRCodeModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    WalletBaseComponent,
    WalletLoadingPlaceholderComponent,
  ],
  providers: [
    WalletGuardService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletModule { }
