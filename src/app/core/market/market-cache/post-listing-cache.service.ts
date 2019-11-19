import { Injectable } from '@angular/core';
import { Template } from 'app/core/market/api/template/template.model';
import { Country } from 'app/core/market/api/countrylist/country.model';

@Injectable()
export class PostListingCacheService {

  // Contains templateId's currently being published
  country: Country;

  constructor() {

  }

  set selectedCountry(country: Country) {
    this.country = country;
  }

  get selectedCountry(): Country {
    return this.country;
  }
}
