import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ExtraBaseComponent } from './base/extra-base.component';
import { ExtraRoutingModule } from './extra-routing.module';

import { HelpComponent } from 'app/main-extra/help/help.component';
import { GlobalSettingsComponent } from 'app/main-extra/global-settings/global-settings.component';
import { WelcomeComponent } from 'app/main-extra/welcome/welcome.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    ExtraRoutingModule
  ],
  declarations: [
    HelpComponent,
    GlobalSettingsComponent,
    ExtraBaseComponent,
    WelcomeComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExtraModule { }
