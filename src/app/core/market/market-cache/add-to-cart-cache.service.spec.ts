import { TestBed, inject } from '@angular/core/testing';

import { AddToCartCacheService } from './add-to-cart-cache.service';

describe('AddToCartCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddToCartCacheService]
    });
  });

  it('should be created', inject([AddToCartCacheService], (service: AddToCartCacheService) => {
    expect(service).toBeTruthy();
  }));
});
