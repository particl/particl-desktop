import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Version } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TopbarComponent } from './topbar/topbar.component';
import { StatusComponent } from './status/status.component';
import { ConsoleModalComponent } from './console-modal/console-modal.component';
import { VersionComponent } from './version/version.component';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';


@NgModule({
  declarations: [
    StatusComponent,
    TopbarComponent,
    ConsoleModalComponent,
    VersionComponent,
    CountdownTimerComponent
  ],
  imports: [
    CommonModule,
    CoreUiModule
  ],
  exports: [
    TopbarComponent,
    VersionComponent,
    CountdownTimerComponent
  ],
  entryComponents: [
    ConsoleModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainSharedModule {
  constructor() {
  }
}
