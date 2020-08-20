import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from 'app/main-extra/welcome/welcome.component';
import { HelpComponent } from 'app/main-extra/help/help.component';
import { BotManagementComponent } from 'app/main-extra/bot-management/bot-management.component';
import { GlobalSettingsComponent } from 'app/main-extra/global-settings/global-settings.component';
import { ExtraBaseComponent } from 'app/main-extra/base/extra-base.component';


const routes: Routes = [
  {
    path: '',
    component: ExtraBaseComponent,
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: 'help', component: HelpComponent },
      { path: 'bot-management', component: BotManagementComponent },
      { path: 'settings', component: GlobalSettingsComponent },
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
