import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { FavouritesService } from './buy-favourites.service';
import { DataService } from '../../services/data/data.service';
import { FavouritedListing } from './buy-favourites.models';


enum TextContent {
  FAILED_LOAD = 'There seems to be a problem fetching favourited items',
  FAILED_REMOVE = 'An error occurred trying to remove the favourite item',
  FAILED_LOAD_DETAILS = 'Could not load listing details. Please try again shortly',
}


@Component({
  selector: 'market-buy-favourites',
  templateUrl: './buy-favourites.component.html',
  styleUrls: ['./buy-favourites.component.scss'],
  providers: [FavouritesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyFavouritesComponent implements OnInit, OnDestroy {

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
    this._sharedService.getListingDetails(id).subscribe(
      (listing) => {
        if (+listing.id > 0) {
          const dialog = this._dialog.open(
            ListingDetailModalComponent,
            {data: {listing, canChat: true, canAction: true}}
          );
          // TODO: Link dialog actions back to applicable actions here
        } else {
          this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn');
        }
      },

      (err) => this._snackbar.open(TextContent.FAILED_LOAD_DETAILS, 'warn')
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
