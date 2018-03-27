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