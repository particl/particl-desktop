import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpComponent } from 'app/extra/help/help.component';


const routes: Routes = [
  { path: 'help', component: HelpComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ExtraRoutingModule { }
