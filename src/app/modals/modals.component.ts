import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  DoCheck,
  ElementRef,
  HostListener,
  OnInit,
  ReflectiveInjector,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { ModalsService } from './modals.service';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { SyncingComponent } from './syncing/syncing.component';
import { PassphraseComponent } from './passphrase/passphrase.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  entryComponents: [
    FirsttimeComponent,
    SyncingComponent,
    PassphraseComponent,
    RecoverwalletComponent
  ]
})
export class ModalsComponent implements DoCheck, OnInit {

  @ViewChild('staticModal')
  public staticModal: ModalDirective;

  @ViewChild('modalContainer', { read: ViewContainerRef })
  private modalContainer: ViewContainerRef;

  public modal: ComponentRef<Component>;
  public hasScrollY: boolean = false;
  public syncPercentage: number = 100;
  private closeOnEscape: boolean = true;

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    if (this.closeOnEscape && event.code.toLowerCase() === 'escape') {
      this.close();
    }
  }

  constructor (
    private _element: ElementRef,
    private _resolver: ComponentFactoryResolver,
    private _modalService: ModalsService
  ) {
    this._modalService.getMessage().subscribe(
      message => this.open(message)
    );
    this._modalService.getProgress().subscribe(
      progress => this.syncPercentage = <number>progress
    );
  }

  ngOnInit() {
  }

  ngDoCheck() {
    if (this._element) {
      const element = this._element.nativeElement;
      const style = element.ownerDocument.defaultView.getComputedStyle(element, undefined);

      this.hasScrollY = style.overflowY === 'scroll' || (style.overflowY === 'auto' && element.clientHeight < element.scrollHeight);
    }
  }

  open(message: any) {
    const factory = this._resolver.resolveComponentFactory(message);
    this.modal = this.modalContainer.createComponent(factory);
    console.log(typeof(this.modal));
    this.staticModal.show();
  }

  close() {
    // remove and destroy message
    this.staticModal.hide();
    this.modalContainer.remove();
    this.modal.destroy();
  }

}
