export class MarketSettings {
    enabled: boolean;
    listingsPerPage: number;
    // @TODO Country type? OR countryCode string type?
    defaultCountry: any;
    listingExpiration: number;
    constructor(obj: any) {
        this.enabled = obj.enabled;
        this.listingsPerPage = obj.listingsPerPage;
        this.defaultCountry = obj.defaultCountry;
        this.listingExpiration = obj.listingExpiration;
    }
}
