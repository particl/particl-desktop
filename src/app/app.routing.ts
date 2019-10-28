import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoadingComponent } from './loading/loading.component';
import { installer_routing } from './installer/installer.router';
import { settings_routing } from './settings/settings.router';

/* actual routing */
const app_routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  settings_routing,
  installer_routing,
  { path: 'wallet', loadChildren: './core-ui/main/main.module#MainModule' }
];

export const app_routing: ModuleWithProviders = RouterModule.forRoot(
  app_routes,
  // { enableTracing: true }
);

