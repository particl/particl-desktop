import { Component } from '@angular/core';
import { SettingsComponent } from './settings.component';

@Component({
  templateUrl: './settings.router.html',
  styleUrls: ['./settings.router.scss']
})
export class SettingsRouterComponent { }

export const settings_routing = {
  path: 'settings',
  component: SettingsRouterComponent,
  children: [
    { path: '', redirectTo: 'update', pathMatch: 'full' },
    { path: 'update', component: SettingsComponent }
  ]
};
