import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { installer_routing } from './installer/installer.router';

/* Preload strategry */
import { PreloadingStrategy, PreloadAllModules, Route } from '@angular/router';
/* end preload strategy */

/* actual routing */
const routes: Routes = [
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
  installer_routing,
  { path: 'wallet', loadChildren: './core-ui/main/main-view.module#MainViewModule'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules});

