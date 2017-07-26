import { Directive, Input, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector : '[focus]'
})
export class Focus {
  constructor(public renderer: Renderer, public elementRef: ElementRef) {}

  @Input()
  set focus(value :boolean) {
    if(value) {
      this.renderer.invokeElementMethod(
          this.elementRef.nativeElement, 'focus', []);
    }
  }
}