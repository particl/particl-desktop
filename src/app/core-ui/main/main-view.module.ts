import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material';

import { MaterialModule } from '../material/material.module';
import { DirectiveModule } from '../directive/directive.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';
import { OrderCountComponent } from './order-count/order-count.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';
import { PercentageBarComponent } from '../../modals/shared/percentage-bar/percentage-bar.component';

import { AnnouncementNotificationComponent } from './announce-notification/announcement-notification.component';
import { ClientVersionService } from '../../core/http/client-version.service';

import { CartComponent } from './cart/cart.component';
import { TimeoffsetComponent } from './status/timeoffset/timeoffset.component';
import { CountBadgeComponent } from 'app/core-ui/main/shared/count-badge/count-badge.component';
// import { CoreUiModule } from 'app/core-ui/core-ui.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MatIconModule,
    DirectiveModule
  ],
  exports: [
    MainViewComponent,
    PercentageBarComponent,
    CountBadgeComponent
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
    OrderCountComponent,
    PercentageBarComponent,
    ConsoleModalComponent,
    AnnouncementNotificationComponent,
    CartComponent,
    TimeoffsetComponent,
    CountBadgeComponent
  ],
  entryComponents: [
    ConsoleModalComponent,
    AnnouncementNotificationComponent
  ],
  providers: [
    ClientVersionService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule { }
