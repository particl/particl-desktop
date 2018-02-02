import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material';

import { MaterialModule } from '../material/material.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';
import { PercentageBarComponent } from '../../modals/shared/percentage-bar/percentage-bar.component';

import { ReleaseNotificationComponent } from './release-notification/release-notification.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MatIconModule
  ],
  exports: [
    MainViewComponent,
    PercentageBarComponent
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
    PercentageBarComponent,
    ConsoleModalComponent,
    ReleaseNotificationComponent
  ],
  entryComponents: [
    ConsoleModalComponent,
    ReleaseNotificationComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule { }
