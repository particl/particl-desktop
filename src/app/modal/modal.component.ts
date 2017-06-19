import {
  Component,
  ViewChild,
  ViewContainerRef,
  Input,
  ReflectiveInjector,
  ComponentFactoryResolver,
  OnInit
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

  private container: any;
  public modal: any = null;
  public sync: Number = 0;
  public message: Object = null;

  @ViewChild('messageContainer', { read: ViewContainerRef })
  messageContainer: ViewContainerRef;

  @Input() set currentModal(data: {component: any, inputs: any }) {

    console.log("ModalComponent");

    if (!data) {
      console.log("no data");
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
    if (this.modal) {
      this.modal.destroy();
    }

    console.log(component);
    console.log(typeof(component));
    this.modal = component;
  }

  constructor (
    private _resolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.container = document.getElementsByClassName("app-modal-container")[0]
    console.log(this.container);
  }

  close() {
    this.container.addEventListener('transitionend', function callback () {
      this.classList.add('app-modal-hide');
      this.removeEventListener('transitionend', callback, false);
    }, false);
    this.container.classList.remove('app-modal-display');
  }

  show() {
    let el = document.getElementsByClassName("app-modal-container")[0];
    el.classList.remove("app-modal-hide");
    el.classList.add("app-modal-display");
  }

  firstTime() {
    this.message = {
      component: FirstTimeModalComponent,
      inputs: {
        sync: 20
      }
    };
    this.show();
  }

}
