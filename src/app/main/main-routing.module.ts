import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModeChangerResolverService } from 'app/main/services/mode-change-resolver';

import { BaseComponent } from 'app/main/base/base.component';


const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    resolve: {
      modeChanger: ModeChangerResolverService
    },
    children: [
      { path: 'extra', loadChildren: () => import('app/main-extra/extra.module').then(m => m.ExtraModule) },
      { path: 'wallet', loadChildren: () => import('app/main-wallet/wallet.module').then(m => m.WalletModule)},
      // { path: 'market', loadChildren: () => import('app/main/market/market.module').then(m => m.MarketModule)}
      { path: '', redirectTo: 'extra', pathMatch: 'full' },
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
export class MainRoutingModule { }
