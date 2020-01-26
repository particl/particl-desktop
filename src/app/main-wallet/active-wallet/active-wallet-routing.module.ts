import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActiveWalletGuard } from './active-wallet.guard';

import { ActiveWalletBaseComponent } from './base/active-wallet-base.component';
import { OverviewComponent } from './overview/overview.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { AddressBookComponent } from './addressbook/addressbook.component';
import { WalletHistoryComponent } from './history/history.component';
import { WalletSettingsComponent } from './settings/settings.component';


const routes: Routes = [
  {
    path: '',
    component: ActiveWalletBaseComponent,
    canActivate: [ActiveWalletGuard],
    children: [
      { path: 'overview', component: OverviewComponent, data: { title: 'Overview'} },
      { path: 'send', component: SendComponent, data: { title: 'Send'} },
      { path: 'receive', component: ReceiveComponent, data: { title: 'Receive'} },
      { path: 'addressbook', component: AddressBookComponent, data: { title: 'Address Book'} },
      { path: 'history', component: WalletHistoryComponent, data: { title: 'History'} },
      { path: 'settings', component: WalletSettingsComponent, data: { title: 'Wallet Settings'} },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ]
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
export class ActiveWalletRoutingModule { }
