import { Template } from '../template/template.model';

export class Listing extends Template {
  public favorite: boolean;
    constructor(listing: any) {
        super(listing);
    }

    /**
     * Returns if a listing is one of our own.
     * (Checks for the existence of a template).
     */
    get isMine(): boolean {
        return this.object.ListingItemTemplate && this.object.ListingItemTemplate.hash;
      }
}
