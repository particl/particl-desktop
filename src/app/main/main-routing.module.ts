import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: '' },
  // { path: 'terms', component: TermsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class MainRoutingModule { }
