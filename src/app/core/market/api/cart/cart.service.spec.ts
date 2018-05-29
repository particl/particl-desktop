import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { CartService } from './cart.service';

describe('CartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [CartService]
    });
  });

  it('should be created', inject([CartService], (service: CartService) => {
    expect(service).toBeTruthy();
  }));
});
