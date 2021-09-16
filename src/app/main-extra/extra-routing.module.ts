import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExtraBaseComponent } from 'app/main-extra/base/extra-base.component';


const routes: Routes = [
  {
    path: '',
    component: ExtraBaseComponent,
    children: [
      { path: 'welcome', loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomeModule) },
      { path: 'help', loadChildren: () => import('./help/help.module').then(m => m.HelpModule) },
      { path: 'settings', loadChildren: () => import('./global-settings/settings.module').then(m => m.SettingsModule) },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
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
