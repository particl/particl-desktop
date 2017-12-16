import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../material/material.module';
import { ModalsModule } from '../../modals/modals.module';
import { CoreModule } from '../../core/core.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';

import { TransactionService } from '../../wallet/wallet/shared/transaction.service';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
  ],
  exports: [
    MainViewComponent,
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
    ConsoleModalComponent
  ],
  entryComponents: [
    ConsoleModalComponent
  ],
  providers: [
    TransactionService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule { }
