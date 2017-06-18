import { Injectable } from '@angular/core';

@Injectable()
export class ModalService {

  private modals: Object = {};

  add(modal: any) {
    this.modals[modal.id] = modal;
  }

  remove(id: string) {
    this.modals[id] = undefined;
  }

  open(id: string) {
    this.modals[id].open();
  }

  close(id: string) {
    this.modals[id].close();
  }
}
