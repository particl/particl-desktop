import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
  { path: 'wallet', loadChildren: './wallet/wallet.module#WalletViewsModule' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);