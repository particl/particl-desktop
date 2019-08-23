import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListingsComponent } from './listings/listings.component';
import { BuyComponent } from './buy/buy.component';
import { SellComponent } from './sell/sell.component';
import { AddItemComponent } from './sell/add-item/add-item.component';
import { ManagementComponent } from './management/management.component';
import { CreateMarketComponent } from './management/create-market/create-market.component';

const routes: Routes = [
  { path: 'listings', component: ListingsComponent, data: { title: 'Listings' } },
  { path: 'buy', component: BuyComponent, data: { title: 'Buy' } },
  { path: 'sell', component: SellComponent, data: { title: 'Sell' } },
  { path: 'template', component: AddItemComponent, data: { title: 'Sell › Add/Edit item' } },
  { path: 'management', component: ManagementComponent, data: { title: 'Markets' } },
  { path: 'create-market', component: CreateMarketComponent, data: { title: 'Markets › Create/Edit Market' } }
];

export const market_routing: ModuleWithProviders = RouterModule.forChild(routes);
