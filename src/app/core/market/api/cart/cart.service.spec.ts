import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { CartService } from './cart.service';
import { CoreModule } from 'app/core/core.module';

describe('CartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [CartService]
    });
  });

  it('should be created', inject([CartService], (service: CartService) => {
    expect(service).toBeTruthy();
  }));
});
