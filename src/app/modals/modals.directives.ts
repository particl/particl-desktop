import { Directive, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector : '[appFocusElement]'
})
export class FocusDirective {
  constructor(public renderer: Renderer, public elementRef: ElementRef) {}

  @Input()
  set appFocusElement(value: boolean) {
    if (value) {
      this.renderer.invokeElementMethod(
          this.elementRef.nativeElement, 'focus', []);
    }
  }
}
