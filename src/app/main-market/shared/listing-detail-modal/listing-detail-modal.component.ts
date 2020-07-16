import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';
import { PartoshiAmount } from 'app/core/util/utils';
import { ListingItemDetail } from './listing-detail.models';


type InitialTabSelectionType = 'default' | 'chat';

interface ListingItemDetailInputs {
  listing: ListingItemDetail;
  canChat: boolean;
  canAction: boolean;
  initTab?: InitialTabSelectionType;
}


enum TextContent {
  UNSET_VALUE = '<unknown>',
  TIMER_SECONDS_REMAINING = 'Less than a minute'
}

@Component({
  templateUrl: './listing-detail-modal.component.html',
  styleUrls: ['./listing-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailModalComponent implements OnInit, OnDestroy {


  private static isObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  private static isArray(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  expiryTimer: string = '';
  initialTab: InitialTabSelectionType = 'default';

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
      images: GalleryItem[];
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


  private readonly SOON_DURATION: number = 1000 * 60 * 60 * 24; // 24 hours
  private destroy$: Subject<void> = new Subject();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ListingItemDetailInputs,
    private _store: Store,
    private _cdr: ChangeDetectorRef
  ) {

    const isInputValuesObject = ListingDetailModalComponent.isObject(data);
    const userDestinationCountry = this._store.selectSnapshot(MarketState.settings).userRegion;

    const input: ListingItemDetail = isInputValuesObject &&
        ListingDetailModalComponent.isObject(data.listing) ?
        JSON.parse(JSON.stringify(data.listing)) : {};

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
    const shipBasePrice = new PartoshiAmount(+inputPrice.base, true);
    const shipLocalPrice = new PartoshiAmount(+inputPrice.shippingDomestic, true);
    const shipIntlPrice = new PartoshiAmount(+inputPrice.shippingIntl, true);
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
        images: inputImages.map(img => new ImageItem({src: img.IMAGE, thumb: img.THUMBNAIL}))
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

    this.showActions = isInputValuesObject && (typeof data.canAction === 'boolean') && (this.details.id > 0) ?
        data.canAction : false;
    this.showComments = isInputValuesObject && (typeof data.canChat === 'boolean') && (this.details.id > 0) ?
        data.canChat : false;


    const expiryTime = +inputTimeValues.expires || 0;
    const now = Date.now();

    this.itemExpiry = {
      timestamp: expiryTime,
      hasExpired: (expiryTime > 0) && (now >= expiryTime),
      isSoon: this.isExpiringSoon(now, expiryTime),
    };

    if (isInputValuesObject && typeof data.initTab === 'string') {
      this.initialTab = data.initTab === 'chat' && this.showComments ? 'chat' : this.initialTab;
    }
  }

  ngOnInit() {

    if ((this.itemExpiry.timestamp > 0) && (!this.itemExpiry.hasExpired)) {
      timer(Date.now() % 1000, 1000).pipe(
        takeUntil(this.destroy$)
      ).subscribe(
        (count) => {
          const now = Date.now();
          if (now > this.itemExpiry.timestamp) {
            this.itemExpiry.hasExpired = true;
            this.itemExpiry.isSoon = false;
            this.destroy$.next();
          } else if (!this.itemExpiry.isSoon && this.isExpiringSoon(now, this.itemExpiry.timestamp)) {
            this.itemExpiry.isSoon = true;
          }

          if (this.itemExpiry.isSoon) {
            this.expiryTimer = this.formatSeconds( (this.itemExpiry.timestamp - now) / 1000);
          }
          if (this.itemExpiry.isSoon || this.itemExpiry.hasExpired) {
            this._cdr.detectChanges();
          }
        }
      );
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private isExpiringSoon(current: number, future: number): boolean {
    return (current < future) && (current > (future - this.SOON_DURATION));
  }


  private formatSeconds(sec: number): string {
    // @TODO: zaSmilingIdiot 2020-07-16 -> Improve this type of crappy string building for translations
    const seconds = Math.floor(sec % 60),
          minutes = Math.floor((sec / 60) % 60),
          hours = Math.floor((sec / 3600) % 3600);

    if ((hours === 0) && (minutes === 0) ) {
      return TextContent.TIMER_SECONDS_REMAINING;
    }
    return `${hours.toString().padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} min ${seconds.toString().padStart(2, '0')} sec`;
  }
}
