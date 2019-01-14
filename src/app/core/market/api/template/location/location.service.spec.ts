import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { LocationService } from './location.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { locationExecute } from 'app/_test/core-test/market-test/template-test/location-test/mock-data';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';

describe('LocationService', () => {
  const templateId = 1;
  const countryCode = 'IN'

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: MarketService, useClass: MockMarketService }
      ]
    });
  });

  it('should be created', inject([LocationService], (service: LocationService) => {
    expect(service).toBeTruthy();
  }));

  it(
    'should execute return the success and response data',
    inject([LocationService, CountryListService], async (service: LocationService, countryService: CountryListService) => {

      expect(service).toBeTruthy();
      expect(countryService).toBeTruthy();

      const country = countryService.getCountryByRegion(countryCode);

      expect(country).not.toBe(null);

      const response = await service.execute('add', templateId, country, null, null).toPromise()
      expect(response).toEqual(locationExecute);
    }));
});
