import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list/list.component';


const routes: Routes = [
  { path: 'list', component: ListComponent, data: { title: 'Bot Management' } },
];

export const bot_routing: ModuleWithProviders = RouterModule.forChild(routes);
