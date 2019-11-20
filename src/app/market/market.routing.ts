import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListingsComponent } from './listings/listings.component';
import { BuyComponent } from './buy/buy.component';
import { SellComponent } from './sell/sell.component';
import { AddItemComponent } from './sell/add-item/add-item.component';
import { ImportListingsComponent } from './sell/import-listings/import-listings.component';

const routes: Routes = [
  { path: 'listings', component: ListingsComponent, data: { title: 'Listings' } },
  { path: 'buy', component: BuyComponent, data: { title: 'Purchases' } },
  { path: 'sell', component: SellComponent, data: { title: 'Sell' } },
  { path: 'template', component: AddItemComponent, data: { title: 'Sell › Add/Edit item' } },
  { path: 'import', component: ImportListingsComponent, data: { title: 'Sell › Import listings' } }
];

export const market_routing: ModuleWithProviders = RouterModule.forChild(routes);
