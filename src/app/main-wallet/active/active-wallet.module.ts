import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ActiveWalletBaseComponent } from './base/active-wallet-base.component';
import { WalletSharedModule } from '../shared/wallet-shared.module';


const routes: Routes = [
  {
    path: '',
    component: ActiveWalletBaseComponent,
    children: [
      { path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) },
      { path: 'send', loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
      { path: 'receive', loadChildren: () => import('./receive/receive.module').then(m => m.ReceiveModule) },
      { path: 'addressbook', loadChildren: () => import('./addressbook/addressbook.module').then(m => m.AddressBookModule) },
      { path: 'history', loadChildren: () => import('./history/history.module').then(m => m.HistoryModule) },
      { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.WalletSettingsModule) },
      { path: '**', redirectTo: 'overview' }
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    WalletSharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ActiveWalletBaseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActiveWalletModule { }
