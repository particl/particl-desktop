import { Component, OnDestroy, ViewChild, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef } from '@angular/core';
import { DomPortalHost, CdkPortal } from '@angular/cdk/portal';
import { Observable, Observer } from 'rxjs';
import { retryWhen } from 'rxjs/operators';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Component({
  selector: 'wallet-menu-actions',
  template: `
    <ng-template cdkPortal>
      <ng-content></ng-content>
    </ng-template>
  `,
  styles: []
})
export class WalletMenuActionsComponent implements AfterViewInit, OnDestroy {

  @ViewChild(CdkPortal, {static: false}) portal: CdkPortal;
  private portalHost: DomPortalHost;


  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
  ) {}

  ngAfterViewInit(): void {
    // Create a portalHost from a DOM element

    const selector$ = this.findPortalHost();
    selector$.pipe(
      retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 3}))
    ).subscribe(
      (ref: DomPortalHost) => {
        this.portalHost = ref;
        // Attach portal to host
        this.portalHost.attach(this.portal);
      },
      () => {
        // FAILED TO FIND THE PORTAL HOST REFERENCE
      }
    );
  }


  ngOnDestroy(): void {
    if (this.portalHost !== null) {
      this.portalHost.detach();
    }
  }


  private findPortalHost(): Observable<DomPortalHost> {
    return Observable.create((observer: Observer<DomPortalHost>) => {
      const ref = new DomPortalHost(
        document.querySelector('#wallet-menu-portal-container'),
        this.componentFactoryResolver,
        this.appRef,
        this.injector
      );

      if (!ref || (ref.outletElement === null)) {
        observer.error('NO PORTAL HOST SELECTOR FOUND');
      } else {
        observer.next(ref);
        observer.complete();
      }
    });
  }
}
