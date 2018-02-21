import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnInit,
  DoCheck,
  ElementRef,
  HostListener,
  ViewChild,
  ViewContainerRef, OnDestroy
} from '@angular/core';
import { Log } from 'ng2-logger'

import { CreateWalletComponent } from './createwallet/createwallet.component';
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { MatDialogRef } from '@angular/material';
import { RpcStateService } from '../core/core.module';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  entryComponents: [
    CreateWalletComponent,
    ColdstakeComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent
  ]
})
export class ModalsComponent implements DoCheck, OnInit, OnDestroy {

  @ViewChild('modalContainer', { read: ViewContainerRef })
  private modalContainer: ViewContainerRef;

  modal: ComponentRef<Component>;
  hasScrollY: boolean = false;
  closeOnEscape: boolean = true;
  enableClose: boolean;
  loadSpinner: boolean;
  private log: any = Log.create('modals.component');
  private destroyed: boolean = false;

  constructor(
    private _element: ElementRef,
    private _resolver: ComponentFactoryResolver,
    public _dialogRef: MatDialogRef<ModalsComponent>,
    private rpcState: RpcStateService) {
  }

  ngOnInit(): void {
    this.rpcState.observe('modal:fullWidth:enableClose')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.enableClose = status);

    this.rpcState.observe('ui:spinner')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.loadSpinner = status);
  }

  ngDoCheck(): void {
    // TODO: undocumented hack?
    if (this._element) {
      const element = this._element.nativeElement;
      const style = element.ownerDocument.defaultView.getComputedStyle(element, undefined);
      this.hasScrollY = style.overflowY === 'scroll'
        || (style.overflowY === 'auto' && element.clientHeight < element.scrollHeight);
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  // open modal
  open(message: any, data?: any): void {
    this.log.d(`open modal ${message.name}` + (data ? ` with data ${data}` : ''));
    this.modalContainer.clear();
    const factory = this._resolver.resolveComponentFactory(message);
    this.modal = this.modalContainer.createComponent(factory);
    const dynamicModal = this.modal as any;
    if (data !== undefined && dynamicModal.instance.setData !== undefined) {
      dynamicModal.instance.setData(data);
    }
  }

  close(): void {
    this._dialogRef.close();
    // remove and destroy message
    this.modalContainer.remove();
    this.modal.destroy();
  }

  // close window on escape
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (this.closeOnEscape && this.enableClose
      && event.key.toLowerCase() === 'escape' && this.modal) {
      this.close();
    }
  }
}
