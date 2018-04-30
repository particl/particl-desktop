import { Injectable, OnDestroy } from '@angular/core';
import { StateService } from '../..//state/state.service';

@Injectable()
export class MarketUiCacheService  implements OnDestroy {

  // Contains templateId's currently being published
  private awaiting: number[] = [];

  posting(templateId: number): void {
    this.awaiting.push(templateId);
  }

  isAwaiting(templateId: number): boolean {
    return this.awaiting.includes(templateId);
  }

  constructor() {

   }

  ngOnDestroy() {
    this
  }
}
