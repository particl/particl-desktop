import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Preload strategry */
import { PreloadingStrategy, PreloadAllModules, Route } from '@angular/router';
/* end preload strategy */

import { LoadingComponent } from './loading/loading.component';
import { InstallerComponent } from './installer/installer.component';

/* actual routing */
const routes: Routes = [
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  { path: 'installer', component: InstallerComponent},
  { path: 'wallet', loadChildren: './wallet/wallet.module#WalletViewsModule'},
  { path: 'market', loadChildren: './market/market.module#MarketModule'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules});

