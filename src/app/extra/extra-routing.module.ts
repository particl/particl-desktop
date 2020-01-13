import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpComponent } from 'app/extra/help/help.component';
import { ExtraBaseComponent } from 'app/extra/base/extra-base.component';


const routes: Routes = [
  {
    path: '',
    component: ExtraBaseComponent,
    children: [
      { path: 'help', component: HelpComponent },
      { path: '', redirectTo: 'help', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ExtraRoutingModule { }
