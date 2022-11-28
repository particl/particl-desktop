import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TopbarComponent } from './topbar/topbar.component';
import { StatusComponent } from './status/status.component';
import { VersionComponent } from './version/version.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';
import { MainLayoutDefaultComponent } from './layout-default/main-layout-default.component';
import { LoadingPlaceholderComponent } from './loading-placeholder/loading-placeholder.component';
import { BlockSyncIndicatorComponent } from './block-sync-indicator/block-sync-indicator.component';
import { ButtonSettingComponent } from './settings/components/button.component';
import { ToggleSettingComponent } from './settings/components/toggle.component';
import { NumberSettingComponent } from './settings/components/number.component';
import { URLSettingComponent } from './settings/components/url.component';
import { SelectSettingComponent } from './settings/components/select.component';



@NgModule({
  declarations: [
    StatusComponent,
    TopbarComponent,
    VersionComponent,
    CountdownTimerComponent,
    MainLayoutDefaultComponent,
    LoadingPlaceholderComponent,
    BlockSyncIndicatorComponent,
    ButtonSettingComponent,
    ToggleSettingComponent,
    NumberSettingComponent,
    URLSettingComponent,
    SelectSettingComponent,
  ],
  imports: [
    CommonModule,
    CoreUiModule
  ],
  exports: [
    TopbarComponent,
    CountdownTimerComponent,
    MainLayoutDefaultComponent,
    LoadingPlaceholderComponent,
    ButtonSettingComponent,
    ToggleSettingComponent,
    NumberSettingComponent,
    URLSettingComponent,
    SelectSettingComponent,
  ],
  entryComponents: [
    ButtonSettingComponent,
    ToggleSettingComponent,
    NumberSettingComponent,
    URLSettingComponent,
    SelectSettingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainSharedModule {
  constructor() {
  }
}
