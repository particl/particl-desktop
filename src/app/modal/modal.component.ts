import {
  Component,
  ViewChild,
  ViewContainerRef,
  Input,
  ReflectiveInjector,
  ComponentFactoryResolver
} from '@angular/core';

import { FirstTimeModalComponent } from './firstTime/firstTime.modal.component';
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

  currentModal = null;
  sync: Number = 0;

  @ViewChild('messageContainer', { read: ViewContainerRef })
  messageContainer: ViewContainerRef;

  @Input() set componentData(data: {component: any, inputs: any }) {
    if (!data) {
      return ;
    }

    // convert input in angular format
    let inputProviders = Object.keys(data.inputs).map((inputName) => {
      return ({
        provide: inputName,
        useValue: data.inputs[inputName]
      });
    });

    // inject input data
    let resolvedInputs = ReflectiveInjector.resolve(inputProviders);
    let injector = ReflectiveInjector.fromResolvedProviders(
      resolvedInputs,
      this.messageContainer.parentInjector
    );

    // create and insert component
    let factory = this._resolver.resolveComponentFactory(data.component);
    let component = factory.create(injector);
    this.messageContainer.insert(component.hostView);

    // destroy previously created component
    if (this.currentModal) {
      this.currentModal.destroy();
    }

    console.log(component);
    console.log(typeof(component));
    this.currentModal = component;
  }

  constructor (
    private _resolver: ComponentFactoryResolver
  ) { }
}
