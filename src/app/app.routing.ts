import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* actual routing */
const app_routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'loading', loadChildren: () => import('app/startup/startup.module').then(m => m.StartupModule) },
  { path: 'main', loadChildren: () => import('app/main/main.module').then(m => m.MainModule) },
];

export const app_routing: ModuleWithProviders = RouterModule.forRoot(
  app_routes,
  // { enableTracing: true }
);

