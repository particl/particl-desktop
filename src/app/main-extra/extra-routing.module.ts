import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpComponent } from 'app/main-extra/help/help.component';
import { GlobalSettingsComponent } from 'app/main-extra/global-settings/global-settings.component';
import { ExtraBaseComponent } from 'app/main-extra/base/extra-base.component';


const routes: Routes = [
  {
    path: '',
    component: ExtraBaseComponent,
    children: [
      { path: 'help', component: HelpComponent },
      { path: 'settings', component: GlobalSettingsComponent },
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
