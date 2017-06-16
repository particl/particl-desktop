import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from './modal.service'

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: [ './modal.component.scss' ]
})

export class ModalComponent implements OnInit, OnDestroy {

  @Input() id: string;
  private elem: any;

  constructor(private ModalService: ModalService) { }

  ngOnInit() {
    console.log("coucou");

    if (!this.id) {
      console.error('modals must have an id');
      return ;
    }

    this.elem = document.getElementById(this.id);
    document.body.appendChild(this.elem);

    this.elem.onclick = function (e: any) {
      console.log(typeof(e));
      console.log(e);
    };

    this.ModalService.add(this);
  }

  ngOnDestroy() {
    console.log("bye");
    this.ModalService.remove(this.id);
    this.elem.remove();
  }

  public open(): void {
    this.elem.show();
    //$('body').addClass('modal-open');
  }
  close(): void {
    this.elem.hide();
    //$('body').removeClass('modal-open');
  }

}
