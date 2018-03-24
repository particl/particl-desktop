// cant use iso3166-2-db/i18n/dispute/UN/en due to sandbox limitations
import { getDataSet, reduce } from 'iso3166-2-db';

export interface Country {
  fips: string;
  iso: string;
  iso3: string;
  name: string;
  numeric: number;
  reference: {
    geonames: number;
    openstreetmap: number;
    wikipedia: string;
  }
}

export class CountryList {
  public countries: Array<Country> = [];
  constructor() {
    this.setCountries();
  }

  private setCountries() {
    const obj = reduce(getDataSet(), 'en');
    this.countries = Object.keys(obj).map((key) => { return obj[key] });
  }
}
