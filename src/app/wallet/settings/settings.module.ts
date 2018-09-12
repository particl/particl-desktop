import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreUiModule.forRoot(),
    CoreModule.forRoot()
  ],
  declarations: [
    SettingsComponent
  ],
  exports: [
    SettingsComponent
  ],
  providers: [
    SettingsService
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
