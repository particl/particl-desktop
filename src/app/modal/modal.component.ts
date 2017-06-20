import {
  Component,
  ViewChild,
  ViewContainerRef,
  Input,
  ReflectiveInjector,
  ComponentFactoryResolver
} from '@angular/core';

import { FirstTimeModalComponent } from './firsttime/firsttime.modal.component';
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

  public container: any;
  public modal: any = null;
  public sync: Number = 0;

  @ViewChild('messageContainer', { read: ViewContainerRef })
  messageContainer: ViewContainerRef;

  @Input() set currentModal(data: {component: any, inputs: any }) {

    this.container = document.getElementsByTagName('app-modal')[0].firstChild;

    if (!data) {
      console.error('Modal was initialized without input data');
      return ;
    }

    // convert input in angular format
    const inputProviders = Object.keys(data.inputs).map((inputName) => {
      return ({
        provide: inputName,
        useValue: data.inputs[inputName]
      });
    });

    // inject input data
    const resolvedInputs = ReflectiveInjector.resolve(inputProviders);
    const injector = ReflectiveInjector.fromResolvedProviders(
      resolvedInputs,
      this.messageContainer.parentInjector
    );

    // create and insert component
    const factory = this._resolver.resolveComponentFactory(data.component);
    const component = factory.create(injector);
    this.messageContainer.insert(component.hostView);

    // destroy previously created component
    if (this.modal) {
      this.modal.destroy();
    }
    this.modal = component;
    this.sync = data.inputs.sync;
  }

  constructor (
    private _resolver: ComponentFactoryResolver
  ) { }

  close() {
    // wait for opacity transition to finish before hiding
    this.container.addEventListener('transitionend', function callback () {
      this.classList.add('app-modal-hide');
      this.removeEventListener('transitionend', callback, false);
    }, false);
    this.container.classList.remove('app-modal-display');
  }

}
