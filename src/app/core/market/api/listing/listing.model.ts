import { Template } from '../template/template.model';

export class Listing extends Template {
  public favorite: boolean;
    constructor(listing: any) {
        super(listing);
    }
}
