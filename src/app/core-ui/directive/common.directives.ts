import { Directive, Input, ElementRef, Renderer, HostListener, OnInit, Output, EventEmitter, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
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
  @Input() debounceTime: number = 250;
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

/* tslint:disable */
@Directive({
  selector: 'img[default]',
  host: {
    '(error)': 'updateUrl()',
    '[src]': 'src'
   }
})
export class ImagePreloadDirective {
  @Input() src: string;
  @Input() default: string;

  updateUrl() {
    this.src = this.default;
  }
}
/* tslint:enable */


@Directive({
    // don't use 'ng' prefix since it's reserved for Angular
    selector: '[appVar]',
})
export class TemplateVariableDirective<T = unknown> {
    // https://angular.io/guide/structural-directives#typing-the-directives-context
    static ngTemplateContextGuard<T>(dir: TemplateVariableDirective<T>, ctx: any): ctx is Context<T> {
        return true;
    }

    private context?: Context<T>;

    constructor(
        private vcRef: ViewContainerRef,
        private templateRef: TemplateRef<Context<T>>
    ) {}

    @Input()
    set appVar(value: T) {
        if (this.context) {
            this.context.appVar = value;
        } else {
            this.context = { appVar: value };
            this.vcRef.createEmbeddedView(this.templateRef, this.context);
        }
    }
}

interface Context<T> {
    appVar: T;
}
