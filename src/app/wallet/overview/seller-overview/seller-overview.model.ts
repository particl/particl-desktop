import { DateFormatter, Amount } from 'app/core/util/utils';

export class SellerModel {

  public totalListing: Array<any>;
  public unpublishCount: number = 0;
  public publishCount: number = 0;
  public expiredCount: number = 0;

  constructor(private listings: any) {
    this.totalListing = listings;
    this.setCounts();
  }

  get totalList() {
    return this.totalListing.length;
  }

  private setCounts() {
    // TODO check if expired as well if required
    this.totalListing.map(listings => {
      if (listings.status === 'Unpublished') {
        this.unpublishCount++;
      } else {
        this.publishCount++;
      }
    })
  }
}
