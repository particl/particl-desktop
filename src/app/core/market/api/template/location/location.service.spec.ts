import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { LocationService } from './location.service';
import { LocationMockService } from 'app/_test/core-test/market-test/template-test/location-test/location-mock.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { executeData } from 'app/_test/core-test/market-test/template-test/location-test/mock-data/execute';

describe('LocationService', () => {
  const templateId = 1;
  const countryCode = 'IN'

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: LocationService, useClass: LocationMockService }
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
      expect(response).toEqual(executeData);
    }));
});
