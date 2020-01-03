import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingComponent } from './loading/loading.component';


const routes: Routes = [
  {
    path: '',
    component: LoadingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartupRoutingModule { }
