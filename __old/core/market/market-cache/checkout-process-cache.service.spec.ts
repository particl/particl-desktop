import { TestBed, inject } from '@angular/core/testing';

import { CheckoutProcessCacheService } from './checkout-process-cache.service';

describe('CheckoutProcessCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutProcessCacheService]
    });
  });

  it('should be created', inject([CheckoutProcessCacheService], (service: CheckoutProcessCacheService) => {
    expect(service).toBeTruthy();
  }));
});
