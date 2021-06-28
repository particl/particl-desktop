import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';




export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}


@Injectable()
export class DeactivationRouteGuard implements CanDeactivate<CanComponentDeactivate> {
  public canDeactivate = (component: CanComponentDeactivate) => component.canDeactivate ? component.canDeactivate() : true;
}