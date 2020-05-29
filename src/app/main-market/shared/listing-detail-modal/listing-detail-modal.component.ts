import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { PartoshiAmount } from 'app/core/util/utils';
import { ListingItem } from '../shared.models';
import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';


interface ListingItemDetailInputs {
  listing: ListingItem;
  canChat: boolean;
  canAction: boolean;
}


enum TextContent {
  UNSET_VALUE = '<unknown>'
}

@Component({
  templateUrl: './listing-detail-modal.component.html',
  styleUrls: ['./listing-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailModalComponent implements OnInit {


  private static isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  private static isArray(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  readonly showActions: boolean;
  readonly showComments: boolean;

  readonly details: {
    id: number;
    hash: string;
    title: string;
    summary: string;
    description: string;
    images: {
      hasNoImages: boolean;
      images: {THUMBNAIL: string, IMAGE: string}[];
    };
    price: {
      base: string;
      shipping: {
        local: string;
        intl: string;
        actual: string;
      };
      escrow: {
        local: string;
        intl: string;
        actual: string;
      };
      total: {
        local: string;
        intl: string;
        actual: string;
      };
    };
    category: string;
    shipping: {
      source: string;
      selectedDestination: string;
      destinations: string[];
      canShip: boolean;
    };
    created: number;
    isOwner: boolean;
  };

  readonly itemExpiry: {
    timestamp: number;
    isSoon: boolean;
    hasExpired: boolean;
  };

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
      inStock: '4–10',
      isAboutToExpire: true,
      expireIn: '23 hours 24 minutes',
      domesticShippingPrice: 20,
      internationalShippingPrice: 25.6,
      escrowPriceDomestic: 885,
      escrowPriceInternational: 1865,
      totalAmountDomestic: 1770,
      totalAmountInternaltional: 3730,
      category: {
        name: 'Business / Corporate'
      },
      country: 'US',
      buyersCountry: 'CZ',
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
  };
  /* << test only */


  private readonly SOON_DURATION: number = 1000 * 60 * 60 * 24; // 24 hours


  constructor(
    @Inject(MAT_DIALOG_DATA) public inputValues: ListingItemDetailInputs,
    private _store: Store
  ) {

    const isInputValuesObject = ListingDetailModalComponent.isObject(inputValues);
    const userDestinationCountry = this._store.selectSnapshot(MarketState.settings).userRegion;

    const input: ListingItem = isInputValuesObject &&
        ListingDetailModalComponent.isObject(inputValues.listing) ?
        JSON.parse(JSON.stringify(inputValues.listing)) : {};

    const inputCategory = ListingDetailModalComponent.isObject(input.category) ? input.category : { title:  TextContent.UNSET_VALUE };
    const inputEscrow = ListingDetailModalComponent.isObject(input.escrow) ? input.escrow : { buyerRatio: 0};
    const inputTimeValues = ListingDetailModalComponent.isObject(input.timeData) ? input.timeData : { created: 0, expires: 0};
    const inputExtras = ListingDetailModalComponent.isObject(input.extra) ? input.extra : { isOwn: false };

    // Validate and extract images
    const isImagesObject = ListingDetailModalComponent.isObject(input.images);
    let inputImages = !isImagesObject || !ListingDetailModalComponent.isArray(input.images.images) ?
        [] :
        input.images.images.filter(img => (typeof img.THUMBNAIL === 'string') && (typeof img.IMAGE === 'string'));

        const hasNoImages = inputImages.length === 0;

    if (inputImages.length === 0) {
      inputImages.push({THUMBNAIL: './assets/images/placeholder_4-3.jpg', IMAGE: './assets/images/placeholder_4-3.jpg'});
    }

    const featuredImgIdx = isImagesObject ? +input.images.featured || 0 : 0;

    if ((featuredImgIdx > 0) && featuredImgIdx < inputImages.length) {
      // re-order the featured image to the front of the images list if not already there
      inputImages = [...inputImages.splice(featuredImgIdx, 1), ...inputImages];
    }

    // Validate and extract shipping info
    const isShipSource = ListingDetailModalComponent.isObject(input.shippingFrom);
    const shipSource = isShipSource && (typeof input.shippingFrom.name === 'string') ? input.shippingFrom.name : '';
    const isShipDests = ListingDetailModalComponent.isArray(input.shippingTo);
    const shipDests: string[] = [];
    const isLocalShipping = userDestinationCountry.length > 0 &&
        userDestinationCountry === (isShipSource && (typeof input.shippingFrom.code === 'string') ? input.shippingFrom.code : '');

    let canShip = false;
    if (isShipDests) {
      input.shippingTo.forEach(dest => {
        if (typeof dest.name === 'string') {
          shipDests.push(dest.name);
        }
        if (!canShip && (typeof dest.code === 'string') && (dest.code === userDestinationCountry)) {
          canShip = true;
        }
      });
    }
    canShip = canShip || (userDestinationCountry.length === 0) || (shipDests.length === 0);

    // Validate and extract initial pricing info
    const inputPrice = ListingDetailModalComponent.isObject(input.price) ? input.price : { base: 0, shippingDomestic: 0, shippingIntl: 0};
    const shipBasePrice = new PartoshiAmount(+inputPrice.base);
    const shipLocalPrice = new PartoshiAmount(+inputPrice.shippingDomestic);
    const shipIntlPrice = new PartoshiAmount(+inputPrice.shippingIntl);
    const shipActualPrice = isLocalShipping ? shipLocalPrice : shipIntlPrice;

    // NB! The price values calculated below use a bit of JS object referential trickery to avoid creating new objects for price type.
    //  ie: the PartoshiAmount is modified and then "snapshot" using the particlString() method (which returns a string value).
    //  Subsequent uses of the same PartoshiAmount object build on top of the last modified value.

    this.details = {
      id: +input.id > 0 ? input.id : 0,
      hash: typeof input.hash === 'string' ? input.hash : '',
      title: typeof input.title === 'string' ? input.title : TextContent.UNSET_VALUE,
      summary: typeof input.summary === 'string' ? input.summary : TextContent.UNSET_VALUE,
      description: typeof input.description === 'string' ? input.description : TextContent.UNSET_VALUE,
      images: {
        hasNoImages: hasNoImages,
        images: inputImages
      },
      price: {
        base: shipBasePrice.particlsString(),
        shipping: {
          local: shipLocalPrice.particlsString(),
          intl: shipIntlPrice.particlsString(),
          actual: shipActualPrice.particlsString()
        },
        escrow: {
          local: shipLocalPrice.add(shipBasePrice).particlsString(),
          intl: shipIntlPrice.add(shipBasePrice).particlsString(),
          actual: shipActualPrice.particlsString()
        },
        total: {
          local: shipLocalPrice.add(shipLocalPrice.multiply(inputEscrow.buyerRatio / 100)).particlsString(),
          intl: shipIntlPrice.add(shipIntlPrice.multiply(inputEscrow.buyerRatio / 100)).particlsString(),
          actual: shipActualPrice.particlsString()
        },
      },
      category: typeof inputCategory.title === 'string' ? inputCategory.title : TextContent.UNSET_VALUE,
      shipping: {
        source: shipSource || TextContent.UNSET_VALUE,
        selectedDestination: userDestinationCountry,
        destinations: shipDests,
        canShip: canShip,
      },
      created: +inputTimeValues.created || 0,
      isOwner: typeof inputExtras.isOwn === 'boolean' ? inputExtras.isOwn : false
    };

    this.showActions = isInputValuesObject && (typeof inputValues.canAction === 'boolean') && (this.details.id > 0) ?
        inputValues.canAction : false;
    this.showComments = isInputValuesObject && (typeof inputValues.canChat === 'boolean') && (this.details.id > 0) ?
        inputValues.canChat : false;


    const expiryTime = +inputTimeValues.expires || 0;
    const now = Date.now();

    this.itemExpiry = {
      timestamp: expiryTime,
      hasExpired: (expiryTime > 0) && (now >= expiryTime),
      isSoon: (now < expiryTime) && (expiryTime > (now + this.SOON_DURATION)),
    };
  }

  ngOnInit() {
  }
}
