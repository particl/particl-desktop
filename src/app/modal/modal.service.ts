import { Injectable } from '@angular/core';

@Injectable()
export class ModalService {

  public modal: any;
  public message: Object = null;

  open(modal) {
    switch (modal) {
      case 'firsttime':
        this.show();
    }
  }

  show() {
    this.modal = document.getElementsByTagName('app-modal')[0].firstChild;
    this.modal.classList.remove('app-modal-hide');
    this.modal.classList.add('app-modal-display');
  }

}
