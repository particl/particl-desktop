import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { ExchangeBaseComponent } from './base/exchange-base.component';


const routes: Routes = [
  {
    path: '',
    component: ExchangeBaseComponent,
    children: [
      { path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.ExchangeOverviewModule) },
      { path: 'new', loadChildren: () => import('./new-exchange/new-exchange.module').then(m => m.NewExchangeModule) },
      { path: 'bots', loadChildren: () => import('./exchange-bots/exchange-bots.module').then(m => m.ExchangeBotsModule) },
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
    ExchangeBaseComponent
  ],
  providers: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExchangeModule { }
