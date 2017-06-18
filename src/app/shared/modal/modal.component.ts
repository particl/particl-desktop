import { Component, Input, OnInit, OnDestroy } from '@angular/core';

/* TODO: should be included by shared */
import { ModalService } from './modal.service'

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})

export class ModalComponent implements OnInit, OnDestroy {

  @Input() id: string;
  private elem: any;
  private container: any;

  constructor(
    private _modalService: ModalService
  ) { }

  ngOnInit() {

    if (!this.id) {
      console.error('modals must have an id');
      return ;
    }

    this.elem = document.getElementById(this.id);
    this.container = this.elem.getElementsByClassName("app-modal-container")[0]
    document.body.appendChild(this.elem);

    this._modalService.add(this);
  }

  ngOnDestroy() {
    this._modalService.remove(this.id);
    this.elem.remove();
  }

  open() {
    this.container.classList.remove('app-modal-hide');
    this.container.classList.add('app-modal-display');
  }

  close() {
    this.container.addEventListener('transitionend', function callback () {
      this.classList.add('app-modal-hide');
      this.removeEventListener('transitionend', callback, false);
    }, false);
    this.container.classList.remove('app-modal-display');
  }

}
