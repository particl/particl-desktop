import { NgModule, ModuleWithProviders } from '@angular/core';

import { ModalComponent } from './modal.component';

import { FirstTimeModalComponent } from './firsttime/firsttime.modal.component';
import { SyncingModalComponent } from './syncing/syncing.modal.component';

@NgModule({
  declarations: [
    ModalComponent,
    FirstTimeModalComponent,
    SyncingModalComponent
  ],
  exports: [
    ModalComponent,
    // TODO
    FirstTimeModalComponent,
    SyncingModalComponent
  ]
})

export class ModalModule { }
