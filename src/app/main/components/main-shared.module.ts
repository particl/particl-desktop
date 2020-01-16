import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TopbarComponent } from './topbar/topbar.component';
import { StatusComponent } from './status/status.component';
import { ConsoleModalComponent } from './console-modal/console-modal.component';


@NgModule({
  declarations: [
    StatusComponent,
    TopbarComponent,
    ConsoleModalComponent
  ],
  imports: [
    CommonModule,
    CoreUiModule
  ],
  exports: [
    TopbarComponent
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
