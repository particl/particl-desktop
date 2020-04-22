import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-listing-detail-modal',
  templateUrl: './listing-detail-modal.component.html',
  styleUrls: ['./listing-detail-modal.component.scss']
})
export class ListingDetailModalComponent implements OnInit {

  /* test only >>> */
  public data: any = {
    listing: {
      title: 'eGift Card - Mastercard ($250) USA',
      shortDescription: 'Digital Delivery (Replaces Tracking Number)',
      longDescription: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
      imageCollection: {
        featuredImage: {
          thumbnail: './assets/images/placeholder_4-3.jpg'
        }
      },
      basePrice: 865,
      isAboutToExpire: true,
      expireIn: '23 hours 24 minutes',
      domesticShippingPrice: 20,
      internationalShippingPrice: 1000,
      escrowPriceDomestic: 885,
      escrowPriceInternational: 1865,
      totalAmountDomestic: 1770,
      totalAmountInternaltional: 3730,
      category: {
        name: 'Business / Corporate'
      },
      country: 'US',
      createdAt: '22-04-2020',
      expiredTime: '24-04-2020',
      hash: 'sdfjsndf',
      listing: {
        seller: 'sdfhbsjhdfb',
      },
      isFlagged: false,
      isMine: false,
      VoteDetails: {
        isReported: false,
      }
    },
    buyPage: false,
  }
  /* << test only */

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['details', 'shipping', 'questions'];

  constructor() { }

  ngOnInit() {
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
