import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Preload strategry */
import { PreloadingStrategy, PreloadAllModules, Route } from '@angular/router';
/* end preload strategy */

import { LoadingComponent } from '../loading/loading.component';

import { MultiwalletRouterComponent } from './multiwallet/multiwallet-router.component';

import { installer_routing } from 'app/installer/installer.routing';

import { MainViewComponent } from 'app/core-ui/main/main-view.component';

import { wallet_routes_children } from 'app/wallet/wallet.routing';
import { market_routes_children } from 'app/market/market.routing';

const walletAndMarketRoutes = wallet_routes_children.concat(<any>market_routes_children);

/* actual routing */
const routes: Routes = [
  { path: '', redirectTo: 'multi', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  {
    path: 'multi',
    component: MultiwalletRouterComponent,
    children: [
        { path: '', redirectTo: 'wallet', pathMatch: 'full' },
        installer_routing,
        { path: 'main', component: MainViewComponent, children: walletAndMarketRoutes }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules});

