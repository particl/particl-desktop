import { Directive, Input, ElementRef, Renderer } from '@angular/core';

/** Focus the given element based on a condition */
@Directive({
  selector : '[appFocusElement]'
})
export class FocusDirective {
  constructor(
    public renderer: Renderer,
    public elementRef: ElementRef) {}

  @Input()
  set appFocusElement(condition: boolean) {
    if (condition) {
      this.renderer.invokeElementMethod(
          this.elementRef.nativeElement, 'focus', []);
    }
  }
}

/** Focus the given element after 500ms, useful for focusing after rendering */
@Directive({
  selector : '[appFocusTimeout]'
})
export class FocusTimeoutDirective {
  constructor(
    public renderer: Renderer,
    public elementRef: ElementRef) {}

  @Input()
  set appFocusTimeout(condition: boolean) {
    if (condition) {
      setTimeout(() => this.renderer.invokeElementMethod(
        this.elementRef.nativeElement, 'focus', []), 500);
    }
  }
}
