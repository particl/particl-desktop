import { Directive, Input, ElementRef, Renderer, HostListener } from '@angular/core';

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

/** Prevent double click of element */
@Directive({
  selector: '[appNoDblClick]'
})
export class NoDblClickDirective {
  
  constructor() { }
  
  @HostListener('click', ['$event'])
  clickEvent(event) {
    const button = (event.srcElement.disabled === undefined) ? event.srcElement.parentElement : event.srcElement;
    button.setAttribute('disabled', true);
    setTimeout(function(){
      button.removeAttribute('disabled');
    }, 1000);
  }

}