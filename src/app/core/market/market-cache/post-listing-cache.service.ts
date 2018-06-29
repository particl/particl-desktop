import { Injectable, OnDestroy } from '@angular/core';
import { StateService } from '../..//state/state.service';
import { Template } from 'app/core/market/api/template/template.model';

@Injectable()
export class PostListingCacheService {

  // Contains templateId's currently being published
  private awaiting: number[] = [];
  selectedCountry: string = 'ZA'; // 'ZA' is country code of South-Africa.

  posting(template: Template): void {
    this.awaiting.push(template.id);
    template.status = 'awaiting';
  }

  isAwaiting(template: Template): boolean {
    return template && template.status === 'unpublished' && this.awaiting.includes(template.id);
  }

  constructor() {

   }

}
