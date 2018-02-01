import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OverviewListingsComponent } from './market.module';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewListingsComponent, data: { title: 'Listings' } }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
