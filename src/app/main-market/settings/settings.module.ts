import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';

import { MarketSettingsComponent } from './settings.component';
import { MarketConsoleModalComponent } from './market-console-modal/market-console-modal.component';
import { GeneralConfigComponent } from './setting-categories/general-config/general-config.component';
import { ModuleSettingsComponent } from './setting-categories/module-settings/module-settings.component';


const routes: Routes = [
  { path: '', component: MarketSettingsComponent, data: { title: 'Market Settings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    MarketSettingsComponent,
    MarketConsoleModalComponent,
    GeneralConfigComponent,
    ModuleSettingsComponent,
  ],
  entryComponents: [
    MarketConsoleModalComponent,
    GeneralConfigComponent,
    ModuleSettingsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule { }
