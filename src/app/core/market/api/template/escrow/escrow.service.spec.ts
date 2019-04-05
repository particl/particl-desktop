import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { EscrowService } from './escrow.service';

describe('EscrowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [EscrowService]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));
});
