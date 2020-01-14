import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from 'app/main/main-routing.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BaseComponent } from './base/base.component';
import { MultiwalletSidebarComponent } from './components/multiwallet/multiwallet-sidebar.component';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { TopbarComponent } from 'app/main/components/topbar/topbar.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';

@NgModule({
  declarations: [
    BaseComponent,
    MultiwalletSidebarComponent,
    ApplicationRestartModalComponent,
    ProcessingModalComponent,
    TopbarComponent
  ],
  imports: [
    CommonModule,
    CoreUiModule,
    MainRoutingModule
  ],
  providers: [
    SnackbarService
  ],
  exports: [
    TopbarComponent
  ],
  entryComponents: [
    ApplicationRestartModalComponent,
    ProcessingModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule {
  constructor() {
  }
}
