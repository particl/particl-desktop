import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActiveWalletBaseComponent } from './base/active-wallet-base.component';
import { OverviewComponent } from './overview/overview.component';
import { SendComponent } from './send/send.component';
import { ReceiveComponent } from './receive/receive.component';
import { AddressBookComponent } from './addressbook/addressbook.component';
import { HistoryComponent } from './history/history.component';
import { WalletSettingsComponent } from './settings/settings.component';


const routes: Routes = [
  {
    path: '',
    component: ActiveWalletBaseComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'send', component: SendComponent },
      { path: 'receive', component: ReceiveComponent },
      { path: 'addressbook', component: AddressBookComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'settings', component: WalletSettingsComponent },
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
