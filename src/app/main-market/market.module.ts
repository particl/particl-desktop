import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { MarketBaseComponent } from './base/market-base.component';
import { AlphaMainnetWarningComponent } from './base/alpha-mainnet-warning/alpha-mainnet-warning.component';


const routes: Routes = [
  {
    path: '',
    component: MarketBaseComponent,
    children: [
      { path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) },
      { path: 'management', loadChildren: () => import('./management/management.module').then(m => m.ManagementModule) },
      { path: 'listings', loadChildren: () => import('./listings/listings.module').then(m => m.ListingsModule) },
      { path: 'buy', loadChildren: () => import('./buy/buy.module').then(m => m.BuyModule) },
      { path: 'sell', loadChildren: () => import('./sell/sell.module').then(m => m.SellModule) },
      { path: 'proposals', loadChildren: () => import('./proposals/proposals.module').then(m => m.ProposalsModule) },
      { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
      { path: '**', redirectTo: 'overview' },
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
    MarketBaseComponent,
    AlphaMainnetWarningComponent
  ],
  entryComponents: [
    AlphaMainnetWarningComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketModule { }
