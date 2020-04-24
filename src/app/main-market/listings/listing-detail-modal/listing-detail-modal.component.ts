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
      longDescription: 'I want to get these to people who need them! (Everyone) I paid a lot for these masks and I am only charging enough markup to allow me to make a bigger order next. Ships Priority Mail USPS, If post office closures happen I will switch to any provider still open with Priority shipping. I am unsure if I can get another shipment in but I will try if these sell quickly.\n\nI am actively seeking to provide more supplies like this. If you would like CASE Pricing or high qty please leave contact info in your private bid and I will contact you.\n\nDOMESTIC USA SHIPPING ONLY. I am unsure if you would recieve it in time otherwise.',
      imageCollection: {
        featuredImage: {
          thumbnail: './assets/images/placeholder_4-3.jpg'
        },
        images: [
          './assets/images/placeholder_4-3.jpg',
          './assets/images/placeholder_1-1.jpg',
          './assets/images/placeholder_4-3.jpg',
          './assets/images/placeholder_3-4.jpg',
          './assets/images/placeholder_1-1.jpg',
          './assets/images/placeholder_4-3.jpg',
          './assets/images/placeholder_3-4.jpg'
        ]
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
      isMine: true,
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
