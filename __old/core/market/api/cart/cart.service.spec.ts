import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { CartService } from './cart.service';

describe('CartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [CartService]
    });
  });

  it('should be created', inject([CartService], (service: CartService) => {
    expect(service).toBeTruthy();
  }));
});
