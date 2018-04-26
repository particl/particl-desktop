import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// cant use iso3166-2-db/i18n/dispute/UN/en due to sandbox limitations
import { getDataSet, reduce } from 'iso3166-2-db';
import { Country } from './country.model';

@Injectable()
export class CountryListService {
  public countries: Array<Country> = [];
  constructor(
  ) {
    this.setCountries();
  }

  private setCountries() {
    const obj = reduce(getDataSet(), 'en');
    this.countries = Object.keys(obj).map(key => obj[key])
      .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  }

  getList(): any {
    return this.countries;
  }

  getCountryByName(name: string): Country {
    return this.countries.find((el) => el.name.toUpperCase() === name.toUpperCase());
  }

  getCountryByRegion(iso: string): Country {
    return iso ? this.countries.find((el) => el.iso.toUpperCase() === iso.toUpperCase()) : undefined;
  }
}
