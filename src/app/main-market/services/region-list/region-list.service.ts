import { Injectable } from '@angular/core';

// can't use iso3166-2-db/i18n/dispute/UN/en due to sandbox limitations
import { getDataSet, reduce } from 'iso3166-2-db';
import { Country } from './country.model';


@Injectable()
export class RegionListService {
  constructor() {}

  getCountryList(): Country[] {
    const countriesObj = (reduce(getDataSet(), 'en'));
    return Object.keys(countriesObj).map(
      key => countriesObj[key]
    ).sort(
      (a: Country, b: Country) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );
  }


  findCountriesByIsoCodes(codes: string[]): Country[] {
    return this.getCountryList().filter(c => codes.includes(c.iso));
  }
}
