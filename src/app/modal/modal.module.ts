import { NgModule } from '@angular/core';

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
    FirstTimeModalComponent,
    SyncingModalComponent
  ]
})

export class ModalModule {

  constructor () {
    document.body.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      ModalComponent.show();
    }, false);
  }


  // syncing() {
  //   this.message = {
  //     component: SyncingModalComponent,
  //     inputs: {
  //       sync: 80
  //     }
  //   };
  // }

}
