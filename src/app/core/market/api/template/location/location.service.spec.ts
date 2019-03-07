import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { LocationService } from './location.service';
import { CoreModule } from 'app/core/core.module';
import { RpcModule } from 'app/core/rpc/rpc.module';

describe('LocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        RpcModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [LocationService]
    });
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
  }));
});
