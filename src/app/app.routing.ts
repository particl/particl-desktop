import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Preload strategry */
import { PreloadingStrategy, PreloadAllModules, Route } from '@angular/router';
/* end preload strategy */

/* actual routing */
const routes: Routes = [
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
  { path: 'wallet', loadChildren: './wallet/wallet.module#WalletViewsModule'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules});

