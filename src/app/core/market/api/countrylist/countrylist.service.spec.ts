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
});
