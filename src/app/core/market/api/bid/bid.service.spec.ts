import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import { MaterialModule } from '../../../../core-ui/material/material.module';
import { BidService } from './bid.service';

import { SnackbarService } from '../../../snackbar/snackbar.service';

describe('BidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        MaterialModule
      ],
      providers: [BidService, SnackbarService]
    });
  });

  it('should be created', inject([BidService], (service: BidService) => {
    expect(service).toBeTruthy();
  }));
});
