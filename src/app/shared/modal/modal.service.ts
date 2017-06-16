import { Injectable } from '@angular/core';

@Injectable()
export class ModalService {

  private modals: Object = {};

  add(modal: any) {
    console.log(modal);
    console.log(typeof(modal));
    this.modals[modal.id] = modal;
  }

  remove(id: string) {
    this.modals[id] = undefined;
  }

  open(id: string): void {
    this.modals[id].open();
  }

  close(id: string) {
    this.modals[id].close();
  }
}
