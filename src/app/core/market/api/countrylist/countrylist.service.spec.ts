import { TestBed, inject } from '@angular/core/testing';

import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
describe('CountryListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CountryListService]
    });
  });

  it('should be created', inject([CountryListService], (service: CountryListService) => {
    expect(service).toBeTruthy();
  }));

  it('should get country list', inject([CountryListService], (service: CountryListService) => {
    expect(service.getList().length).toBeGreaterThan(0);
  }));

  it('should search country by name', inject([CountryListService], (service: CountryListService) => {
    const mockString = 'Andorra'
    expect(service.getCountryByName(mockString).name).toBe(mockString);
  }));

  it('should return nil country ', inject([CountryListService], (service: CountryListService) => {
    const mockString = 'and'
    expect(service.getCountryByName(mockString)).toBe(undefined);
  }));

});
