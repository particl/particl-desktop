import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { EscrowService } from './escrow.service';
import { CoreModule } from 'app/core/core.module';

describe('EscrowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [EscrowService]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));
});
