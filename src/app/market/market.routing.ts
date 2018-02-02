import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewListingsComponent } from './overview-listings/overview-listings.component';
import { BuyComponent } from './buy/buy.component';
import { SellComponent } from './sell/sell.component';
import { AddItemComponent } from './sell/add-item/add-item.component';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewListingsComponent, data: { title: 'Listings' } },
  { path: 'buy', component: BuyComponent, data: { title: 'Buy' } },
  { path: 'sell', component: SellComponent, data: { title: 'Sell' } },
  { path: 'add-item', component: AddItemComponent, data: { title: 'Sell - add item' } }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
