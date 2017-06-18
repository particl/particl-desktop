import { NgModule } from '@angular/core';

import { FirstTimeModalComponent } from './firstTime/firstTime.modal.component';
import { SyncingModalComponent } from './syncing/syncing.modal.component';

@NgModule({
  declarations: [
    FirstTimeModalComponent,
    SyncingModalComponent
  ],
  exports: [
    FirstTimeModalComponent,
    SyncingModalComponent
  ]
})

export class ModalModule {

  message: Object = null;

  firstTime() {
    this.message = {
      component: FirstTimeModalComponent,
      inputs: {
        sync: 20
      }
    };
  }

  syncing() {
    this.message = {
      component: SyncingModalComponent,
      inputs: {
        sync: 80
      }
    };
  }

}
