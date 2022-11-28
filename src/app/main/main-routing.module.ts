import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BaseComponent } from 'app/main/base/base.component';
// import { MainRoutingGuard } from './main-guard-service';


export const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    children: [
      { path: 'extra', loadChildren: () => import('app/main-extra/extra.module').then(m => m.ExtraModule) },
      { path: 'core',
        loadChildren: () => import('app/main-core-config/core-config.module').then(m => m.CoreConfigModule),
        data: {
          showShortcut: false,
          icon: 'part-globe',
          title: 'Core',
          description: 'Particl Core configuration and settings',
        }
      },
      { path: 'wallet',
        loadChildren: () => import('app/main-wallet/wallet.module').then(m => m.WalletModule),
        data: {
          showShortcut: true,
          icon: 'part-stake',
          title: 'Wallet',
          description: 'Send, receive and manage PART coins',
        }
      },
      { path: 'market',
        loadChildren: () => import('app/main-market/market.module').then(m => m.MarketModule),
        data: {
          showShortcut: true,
          icon: 'part-bag',
          title: 'Market',
          description: 'Buy and sell on the most private markets',
        }
      },
      { path: 'governance',
        loadChildren: () => import('app/main-governance/governance.module').then(m => m.GovernanceModule),
        // canActivate: [MainRoutingGuard],
        // canActivateChild: [MainRoutingGuard],
        //canLoad: [MainRoutingGuard],
        data: {
          showShortcut: true,
          icon: 'part-vote',
          title: 'Govern',
          description: 'Community governance proposals and voting'
        }
      },
      { path: '', redirectTo: 'extra', pathMatch: 'full'},
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
