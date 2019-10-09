import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { MaterialModule } from 'app/core-ui/material/material.module';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';
import { SharedModule } from 'app/wallet/shared/shared.module';

import { SettingsRouterComponent } from './settings.router';
import { SettingsComponent } from './settings.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsStateService } from './settings-state.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClipboardModule,
    MaterialModule,
    DirectiveModule,
    CoreUiModule,
    MultiwalletModule,
    SharedModule
  ],
  exports: [SettingsRouterComponent],
  declarations: [
    SettingsRouterComponent,
    SettingsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingsModule,
      providers: [
        SettingsStateService
      ]
    };
  }
}
