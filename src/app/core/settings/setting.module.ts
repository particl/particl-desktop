import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingStateService } from 'app/core/settings/setting-state/setting-state.service';

@NgModule({
  imports: [
    CommonModule,
  ]
})
export class SettingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingModule,
      providers: [
        SettingStateService
      ]
    };
  }
}

