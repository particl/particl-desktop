import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* actual routing */
const app_routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'loading', loadChildren: () => require('./startup/startup.module').then(m => m.StartupModule) }
];

export const app_routing: ModuleWithProviders = RouterModule.forRoot(
  app_routes,
  // { enableTracing: true }
);

