import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { QRCodeModule } from 'angularx-qrcode';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { WalletBaseComponent } from './base/wallet-base.component';
import { WalletLoadingPlaceholderComponent } from './base/wallet-loading-placeholder/wallet-loading-placeholder.component';


const routes: Routes = [
  {
    path: '',
    component: WalletBaseComponent,
    children: [
      { path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) },
      { path: 'send', loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
      { path: 'receive', loadChildren: () => import('./receive/receive.module').then(m => m.ReceiveModule) },
      { path: 'addressbook', loadChildren: () => import('./addressbook/addressbook.module').then(m => m.AddressBookModule) },
      { path: 'history', loadChildren: () => import('./history/history.module').then(m => m.HistoryModule) },
      { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.WalletSettingsModule) },
      { path: 'create', loadChildren: () => import('./create-wallet/create-wallet.module').then(m => m.CreateWalletModule) },
      { path: '**', redirectTo: 'overview' }
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletModule { }
