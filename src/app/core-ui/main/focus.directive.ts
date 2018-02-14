import { Directive, Input, ElementRef, Renderer } from '@angular/core';

/** Focus the given element based on a condition */
@Directive({
  selector : '[appFocusElement]'
})

export class FocusElementDirective {
  constructor(
    public renderer: Renderer,
    public elementRef: ElementRef) {}

  @Input()
  set appFocusElement(condition: boolean) {
    if (condition) {
      setTimeout(() => this.renderer.invokeElementMethod(
        this.elementRef.nativeElement, 'focus', []), 500);
    }
  }
}
