import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingComponent } from 'app/startup/loading/loading.component';
import { TermsComponent } from 'app/startup/terms/terms.component';


const routes: Routes = [
  { path: 'loading', component: LoadingComponent },
  { path: 'terms', component: TermsComponent },
  { path: '', redirectTo: 'loading' },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class StartupRoutingModule { }
