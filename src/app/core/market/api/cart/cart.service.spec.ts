import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import { MaterialModule } from '../../../../core-ui/material/material.module';

import { CartService } from './cart.service';
import { SnackbarService } from '../../../snackbar/snackbar.service';

describe('CartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        MaterialModule
      ],
      providers: [CartService, SnackbarService]
    });
  });

  it('should be created', inject([CartService], (service: CartService) => {
    expect(service).toBeTruthy();
  }));
});
