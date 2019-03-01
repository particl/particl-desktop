import { ModuleWithProviders } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { LoadingComponent } from './loading/loading.component';

import { installer_routing } from './installer/installer.router';

export const app_routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  installer_routing,
  { path: ':wallet', loadChildren: './core-ui/main/main-view.module#MainViewModule' }
];

export const app_routing: ModuleWithProviders = RouterModule.forRoot(
  app_routes,
  // { enableTracing: true }
);
