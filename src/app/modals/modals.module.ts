import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap';
import { ModalsComponent } from './modals.component';
import { ModalsService } from './modals.service';

import { SyncingComponent } from './syncing/syncing.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';
import { GeneratewalletComponent } from './generatewallet/generatewallet.component';
import { FirsttimeComponent } from './firsttime/firsttime.component';


@NgModule({
  imports: [
    CommonModule,
    ModalModule
  ],
  declarations: [
    ModalsComponent,
    SyncingComponent,
    RecoverwalletComponent,
    GeneratewalletComponent,
    FirsttimeComponent,
  ],
  exports: [
    ModalsComponent
  ],
  providers: [ModalsService]
})
export class ModalsModule { }
