import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, Subject, timer } from 'rxjs';
import { finalize, takeUntil, take } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { FavouritesService } from './buy-favourites.service';
import { DataService } from '../../services/data/data.service';
import { FavouritedListing } from './buy-favourites.models';
import { CartDetail } from '../../store/market.models';


enum TextContent {
  FAILED_LOAD = 'There seems to be a problem fetching favourited items',
  FAILED_REMOVE = 'An error occurred trying to remove the favourite item',
  FAILED_LOAD_DETAILS = 'Could not load listing details. Please try again shortly',
  CART_ADD_INVALID = 'The selected item cannot be added to the cart',
  CART_ADD_FAILED = 'Something went wrong adding the item to the cart',
  CART_ADD_DUPLICATE = 'That item is already in the cart',
  CART_ADD_SUCCESS = 'Successfully added to cart'
}


@Component({
  selector: 'market-buy-favourites',
  templateUrl: './buy-favourites.component.html',
  styleUrls: ['./buy-favourites.component.scss'],
  providers: [FavouritesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyFavouritesComponent implements OnInit, OnDestroy {

  @Select(MarketState.availableCarts) availableCarts: Observable<CartDetail[]>;

  favouriteList: FavouritedListing[] = [];
  isLoadingItems: boolean = true;

  private destroy$: Subject<void> = new Subject();
  private readonly EXPIRY_COUNT: number = 5;
  private expiryDates: number[] = [];


  constructor(
    private _favService: FavouritesService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
  ) { }


  ngOnInit() {
    this._favService.fetchFavourites().pipe(
      finalize(() => {
        this.isLoadingItems = false;
        this._cdr.detectChanges();
      })
    ).subscribe(
      (items) => {
        this.favouriteList = items;
        this.updateExpiryList();
        this.startExpirationTimer();
      },
      (_) => this._snackbar.open(TextContent.FAILED_LOAD)
    );
  }


  ngOnDestroy() {
    this.expiryDates = [];
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByFavFn(index: number, item: FavouritedListing): number {
    return item.favouriteId;
  }


  removeFromFav(idx: number) {
    const favItem: FavouritedListing = this.favouriteList[idx];

    if (!favItem || !favItem.favouriteId) {
      return;
    }

    this._favService.removeFavourite(favItem.favouriteId).subscribe(
      (success) => {
        if (!success) {
          this._snackbar.open(TextContent.FAILED_REMOVE, 'warn');
          return;
        }

        this.favouriteList.splice(idx, 1);
        this._cdr.detectChanges();
      }
    );
  }


  openListingDetailModal(id: number): void {
    this._sharedService.getListingDetailsForMarket(id, 0).subscribe(
      (listing) => {
        if (+listing.id <= 0) {
          this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn');
          return;
        }

        const dialogRef = this._dialog.open(
          ListingDetailModalComponent,
          {
            data: {
              listing,
              canChat: true,
              initTab: 'default',
              displayActions: {
                cart: true,
                governance: false,
                fav: true
              }
            }
          }
        );


        let favId = listing.extra.favouriteId;

        dialogRef.componentInstance.eventFavouritedItem.subscribe(
          (newFavId) => favId = newFavId
        );

        dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
          if (favId !== listing.extra.favouriteId) {

            // favourite Id of this listing changed
            const foundListingIdx = this.favouriteList.findIndex(f => f.listingId === listing.id);

            if ((foundListingIdx > -1) && (this.favouriteList[foundListingIdx].listingId === id)) {
              if (favId === 0) {
                this.favouriteList.splice(foundListingIdx, 1);
              } else {
                this.favouriteList[foundListingIdx].favouriteId = favId;
              }
              this._cdr.detectChanges();
            }
          }
        });
      },

      (err) => this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn')
    );
  }


  addItemToCart(favIndex: number, cartId: number) {
    if (!cartId || !(+favIndex >= 0) || !(+favIndex < this.favouriteList.length) ) {
      return;
    }

    const fav = this.favouriteList[favIndex];

    if (!fav || !fav.listingId || !fav.canAddToCart) {
      this._snackbar.open(TextContent.CART_ADD_INVALID, 'err');
      return;
    }

    this._favService.addItemToCart(fav.listingId, cartId).subscribe(
      () => {
        this._snackbar.open(TextContent.CART_ADD_SUCCESS);
      },
      (err) => {
        let msg = TextContent.CART_ADD_FAILED;
        if (err === 'ListingItem already added to ShoppingCart') {
          msg = TextContent.CART_ADD_DUPLICATE;
        }
        this._snackbar.open(msg, 'warn');
      }
    );
  }


  private updateExpiryList(): void {
    this.expiryDates = [];
    const now = Date.now();
    this.favouriteList.filter(
      fav => (fav.expiry > now) && fav.canAddToCart
    ).sort(
      (a, b) => a.expiry - b.expiry
    ).slice(
      0, this.EXPIRY_COUNT
    ).forEach(f => {
      if (f) {
        this.expiryDates.push(f.expiry);
      }
    });
  }


  private startExpirationTimer(): void {
    const idx = this.expiryDates.findIndex(ed => ed > Date.now());

    if (idx > 0) {
      this.expiryDates.splice(0, idx);
    }

    const now = Date.now();

    if (((this.expiryDates[0] || 0) - now) > 0) {
      timer(this.expiryDates[0] - now).pipe(takeUntil(this.destroy$)).subscribe(
        () => {
          if (this.expiryDates.length <= (this.EXPIRY_COUNT / 2)) {
            this.updateExpiryList();
          }

          this.setListingsToExpired();

          if (this.expiryDates.length) {
            this.startExpirationTimer();
          }
        }
      );
    } else {
      this.setListingsToExpired();
    }
  }


  private setListingsToExpired(): void {
    const idx = this.expiryDates.findIndex(ed => ed > Date.now());
    let value = Number.MAX_SAFE_INTEGER;

    if (idx > -1) {
      value = this.expiryDates[idx];
    }

    let doUpdate = false;

    this.favouriteList.forEach(item => {
      if (item.canAddToCart && item.expiry <= value) {
        item.canAddToCart = false;
        doUpdate = true;
      }
    });

    if (doUpdate) {
      this._cdr.detectChanges();
    }

  }
}
