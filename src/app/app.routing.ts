
import { Component, ModuleWithProviders, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Routes, RouterModule } from '@angular/router';

import { LoadingComponent } from './loading/loading.component';

import { installer_routing } from './installer/installer.router';


export const app_routes: Routes = [
  { path: '', redirectTo: 'loading', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  installer_routing,
  { path: ':wallet', loadChildren: './core-ui/main/main.module#MainModule'}
];

export const app_routing: ModuleWithProviders = RouterModule.forRoot(
  app_routes,
 // { enableTracing: true }
);

