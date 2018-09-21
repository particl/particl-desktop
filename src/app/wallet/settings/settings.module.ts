import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    CoreModule.forRoot()
  ],
  declarations: [
    SettingsComponent
  ],
  exports: [
    SettingsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SettingsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingsModule,
      providers: [
        SettingsService
      ]
    };
  }
}