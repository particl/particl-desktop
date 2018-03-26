import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { LocationService } from './location.service';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [LocationService]
    });
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
  }));
});
