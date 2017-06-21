import {
  Component,
  ViewChild,
  ViewContainerRef,
  ReflectiveInjector,
  ComponentFactoryResolver,
  ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ModalService } from './modal.service';

import { FirstTimeModalComponent } from './first-time/first-time.modal.component';
import { SyncingModalComponent } from './syncing/syncing.modal.component'

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  entryComponents: [
    FirstTimeModalComponent,
    SyncingModalComponent
  ]
})
export class ModalComponent {

  @ViewChild('messageContainer', { read: ViewContainerRef })
  messageContainer: ViewContainerRef;

  modal: any;
  progress: Number = 0;
  progressFormated: string;

  constructor (
    private _element: ElementRef,
    private _resolver: ComponentFactoryResolver,
    private _modalService: ModalService
  ) {
    this._modalService.getMessage().subscribe(
      message => this.open(message)
    );
    this._modalService.getProgress().subscribe(
      progress => this.updateProgress(progress)
    );
  }

  open(message: any) {
    const factory = this._resolver.resolveComponentFactory(message);
    this.modal = this.messageContainer.createComponent(factory);
    console.log(typeof(this.modal));
  }

  updateProgress(progress: Number) {
    this.progress = progress;
    if (progress < 100) {
      this.progressFormated = `${progress} %`
    } else {
      this.progressFormated = 'Fully synced !'
    }
  }

  close() {
    // wait for opacity transition to finish before hiding
    const container: any = this._element.nativeElement.firstChild;
    container.addEventListener('transitionend', function callback () {
      this.classList.add('app-modal-hide');
      this.removeEventListener('transitionend', callback, false);
    }, false);
    container.classList.remove('app-modal-display');

    // remove and destroy message
    this.messageContainer.remove();
    this.modal.destroy();
  }

}
