import { Directive, ViewContainerRef } from '@angular/core';


@Directive({
  // tslint:disable:directive-selector
  selector: '[importer]',
  // tslint:enable:directive-selector
})
export class ImporterDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
