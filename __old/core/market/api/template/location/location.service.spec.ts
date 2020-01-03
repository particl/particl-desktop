import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { LocationService } from './location.service';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [LocationService]
    });
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
  }));
});
