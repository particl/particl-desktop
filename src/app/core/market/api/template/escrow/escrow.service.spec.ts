import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { EscrowService } from './escrow.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';

describe('EscrowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [EscrowService]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));
});
