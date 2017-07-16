import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnInit,
  DoCheck,
  ElementRef,
  HostListener,
  ReflectiveInjector,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { ModalsService } from './modals.service';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { ShowpassphraseComponent } from './firsttime/showpassphrase/showpassphrase.component';
import { FinishComponent } from './firsttime/finish/finish.component';
import { GeneratewalletComponent } from './generatewallet/generatewallet.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  entryComponents: [
    FirsttimeComponent,
    ShowpassphraseComponent,
    FinishComponent,
    GeneratewalletComponent,
    RecoverwalletComponent,
    SyncingComponent,
    UnlockwalletComponent
  ]
})
export class ModalsComponent implements DoCheck, OnInit {

  @ViewChild('staticModal')
  public staticModal: ModalDirective;

  @ViewChild('modalContainer', { read: ViewContainerRef })
  private modalContainer: ViewContainerRef;

  modal: ComponentRef<Component>;
  hasScrollY: boolean = false;
  syncPercentage: number = 0;
  syncString: string;
  closeOnEscape: boolean = true;

  constructor (
    private _element: ElementRef,
    private _resolver: ComponentFactoryResolver,
    private _modalService: ModalsService
  ) {
    this._modalService.getMessage().subscribe(
      message => {
        if (this.modal) {
          this.close();
        }
        this.open(message)
      }
    );
    this._modalService.getProgress().subscribe(
      progress => this.updateProgress(<number>progress)
    );
  }

  ngOnInit() {
    document.onkeydown = (event: any) => {
      if (this.closeOnEscape
          && event.key.toLowerCase() === 'escape'
          && this.modal) {
        this.close();
      }
    };
  }

  ngDoCheck() {
    if (this._element) {
      const element = this._element.nativeElement;
      const style = element.ownerDocument.defaultView.getComputedStyle(element, undefined);
      this.hasScrollY = style.overflowY === 'scroll'
        || (style.overflowY === 'auto' && element.clientHeight < element.scrollHeight);
    }
  }

  updateProgress(progress: number) {
    this.syncPercentage = progress;
    this.syncString = progress === 100
      ? 'blockchain fully synced'
      : `${progress.toFixed(2)} %`
  }

  open(message: any) {
    if (this.modal) {
      this.modal.destroy();
    }
    const factory = this._resolver.resolveComponentFactory(message);
    this.modal = this.modalContainer.createComponent(factory);
    this.staticModal.show();
  }

  close() {
    // remove and destroy message
    this._modalService.close();
    this.staticModal.hide();
    this.modalContainer.remove();
    this.modal.destroy();
  }
}
