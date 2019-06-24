import { Directive, Input, ElementRef, Renderer, HostListener, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

/** Debounce click on element */
@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Input() debounceTime: number = 1000;
  @Output() debounceClick: EventEmitter<any> = new EventEmitter();
  private clicks: Subject<any> = new Subject();
  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.subscription = this.clicks.pipe(
      debounceTime(this.debounceTime)
    ).subscribe(e => this.debounceClick.emit(e));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}
