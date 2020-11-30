import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { Subject, of, forkJoin, merge, Observable, combineLatest, iif, defer, timer } from 'rxjs';
import { map, startWith, catchError, takeUntil, tap, distinctUntilChanged, finalize, concatMap, mapTo } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { BuyCartService } from './buy-cart.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';
import { PlaceBidModalComponent, BidModalData } from './place-bid-modal/place-bid-modal.component';
import { ShippingProfileAddressFormComponent } from '../../shared/shipping-profile-address-form/shipping-profile-address-form.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { CartItem } from './buy-cart.models';
import { ShippingAddress } from '../../shared/shipping-profile-address-form/shipping-profile-address.models';
import { Identity } from '../../store/market.models';
import { PriceItem } from '../../shared/market.models';
import { PartoshiAmount } from 'app/core/util/utils';


enum TextContent {
  LOADING_ERROR = 'Could not obtain all data for this page',
  CART_ITEM_REMOVE_ERROR = 'An error occurred while trying to remove that item',
  CART_CLEAR_ERROR = 'Could not remove 1 or more items from the cart',
  PROCESSING_CHECKOUT = 'Placing bids on your items',
  BID_SEND_ERROR = 'Error: Not all of your bids were able to be placed!',
  BID_CONSISTENCY_ERROR = 'Something went wrong during bidding. Please verify orders placed vs cart items',
  BID_SUCCESSFUL = 'Successfully bid on items!'
}


interface DisplayedCartItem extends CartItem {
  displayedPrices: {
    item: PriceItem;
    shipping: PriceItem;
    subtotal: PriceItem;
  };
  errors: {
    expiring: boolean;
    expired: boolean;
    shipping: boolean;
  };
}

interface PricingTotals {
  items: PriceItem;
  shipping: PriceItem;
  subtotal: PriceItem;
  escrow: PriceItem;
  orderTotal: PriceItem;
}


@Component({
  selector: 'market-buy-checkout-cart',
  templateUrl: './buy-cart.component.html',
  styleUrls: ['./buy-cart.component.scss'],
  providers: [BuyCartService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyCartComponent implements OnInit, OnDestroy {

  @Select(MarketState.currentIdentity) identity$: Observable<Identity>;

  // list of things to display
  cartItems: DisplayedCartItem[] = [];
  addresses: ShippingAddress[] = [];
  pricingSummary: PricingTotals = {
    items: { whole: '', sep: '', fraction: ''},
    shipping: { whole: '', sep: '', fraction: ''},
    subtotal: { whole: '', sep: '', fraction: ''},
    escrow: { whole: '', sep: '', fraction: ''},
    orderTotal: { whole: '', sep: '', fraction: ''}
  };

  // other address controls
  selectedAddress: FormControl = new FormControl('0');
  modifyShippingProfile: FormControl = new FormControl(false);
  addressTitleField: FormControl = new FormControl(
    {value: '', disabled: true}, [Validators.required, Validators.minLength(1), Validators.maxLength(100)]
  );

  // for validity
  isAddressValid: FormControl = new FormControl(false);  // public so as to set this value
  canCheckoutForm: FormControl = new FormControl(false); // public so as to read this value
  selectedLocation: FormControl = new FormControl('');


  private destroy$: Subject<void> = new Subject();
  private timerDestroy$: Subject<void> = new Subject();
  private cartModified: FormControl = new FormControl();
  private hasCartErrors: FormControl  = new FormControl(true);
  private isProcessing: boolean = false;  // internal (not necessarily visible) check to limit concurrent MP activity

  private readonly ROUTE_TO_PURCHASED_ORDERS: string = '/main/market/buy/';

  @ViewChild(ShippingProfileAddressFormComponent, {static: false}) private addressForm: ShippingProfileAddressFormComponent;

  constructor(
    private _cartService: BuyCartService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute
  ) { }


  ngOnInit() {

    // <-- HELPER FOR DETECTING SHIPPING COUNTRY CHANGES -->

    const locationUpdate$ = this.selectedLocation.valueChanges.pipe(
      distinctUntilChanged(),
      tap((countryCode: string) => {
        this.updateCartItemPricing();
        this.cartModified.setValue(true);
      }),
      takeUntil(this.destroy$)
    );

    // <-- WATCH FOR AND HANDLE ADDRESS MODIFICATIONS  -->

    const addressChanger$ = this.selectedAddress.valueChanges.pipe(
      tap((addressId: string) => {
        const foundAddr = this.addresses.find(addr => addr.id === +addressId);
        this.addressForm.resetAddressForm(foundAddr);
        this.addressTitleField.setValue((foundAddr && foundAddr.title) || '');
      }),
      takeUntil(this.destroy$)
    );

    // <-- WATCH FOR AND HANDLE CART ITEM MODIFICATIONS  -->

    const cartUpdated$ = this.cartModified.valueChanges.pipe(
      tap(() => {
        const hasErrors = (this.cartItems.length === 0) || (this.cartItems.findIndex(ci => ci.errors.expired || ci.errors.shipping) > -1);
        this.hasCartErrors.setValue(hasErrors);
      }),
      takeUntil(this.destroy$)
    );


    // <-- PROCESS CHECKOUT VALIDITY -->

    const addressValidity$: Observable<boolean> = combineLatest(
      this.isAddressValid.valueChanges.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),
      this.modifyShippingProfile.valueChanges.pipe(
        startWith(this.modifyShippingProfile.value),
        tap((chcked: boolean) => {
          if (chcked) { this.addressTitleField.enable(); } else { this.addressTitleField.disable(); }
        }),
        takeUntil(this.destroy$)
      ),
      this.addressTitleField.valueChanges.pipe(
        startWith(this.addressTitleField.value),
        map(() => this.addressTitleField.valid),
        takeUntil(this.destroy$)
      )
    ).pipe(
      map(([formValid, shouldSaveForm, titleValid]: [boolean, boolean, boolean]) => formValid && (shouldSaveForm ? titleValid : true)),
      takeUntil(this.destroy$)
    );


    const checkoutChecker$ = combineLatest(
      addressValidity$.pipe(startWith(false), distinctUntilChanged(), takeUntil(this.destroy$)),
      this.hasCartErrors.valueChanges.pipe(startWith(true), takeUntil(this.destroy$))
    ).pipe(
      map(([addressValid, cartValid]: [boolean, boolean]) => addressValid && !cartValid),
      tap(isValid => {
        this.canCheckoutForm.setValue(isValid);
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    merge(
      cartUpdated$,
      locationUpdate$,
      addressChanger$,
      checkoutChecker$,
      this.identity$.pipe(
        tap(() => {
          this.cartItems = [];
          this.updateCartExpiryTimer();
          this.updateCartItemPricing();
          this.cartModified.setValue(true);
        }),
        concatMap((identity) => iif(() => identity.id > 0, defer(() => this.fetchData()))),
        takeUntil(this.destroy$)
      )
    ).subscribe();
  }


  ngOnDestroy() {
    this.cartItems = [];
    this.addresses = [];
    this.timerDestroy$.next();
    this.timerDestroy$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByCartItemIdx(idx: number, item: DisplayedCartItem) {
    return item.listingId;
  }


  trackByAddressIdx(idx: number, item: ShippingAddress) {
    return item.id;
  }


  openListingDetailModal(listingId: number): void {
    this._cartService.getListingItemDetails(listingId).subscribe(
      (listing) => {
        if (+listing.id <= 0) {
          // do something useful here to inform that the listing failed to load??
          return;
        }

        this._dialog.open(
          ListingDetailModalComponent,
          {
            data: {
              listing,
              canChat: false,
              initTab: 'default',
              displayActions: {
                cart: false,
                governance: false,
                fav: false
              }
            }
          }
        );
      },
      (err) => {
        // do something useful here to inform that the listing failed to load??
      }
    );
  }

  openPlaceBidModal(): void {
    if (!this.canCheckoutForm.value || this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    let isCartStateGood = true;

    const addressFields = this.addressForm.getFormValues();

    const checkout$ = defer(() => {

      let address$ = of(false);

      if (this.modifyShippingProfile.value) {
        // save or update the address
        address$ = this._cartService.saveAddressFields(
          this.addressTitleField.value,
          addressFields.firstName || '',
          addressFields.lastName || '',
          addressFields.addressLine1 || '',
          addressFields.addressLine2 || '',
          addressFields.city || '',
          addressFields.state || '',
          addressFields.countryCode || '',
          addressFields.zipCode || '',
          +this.selectedAddress.value
        ).pipe(
          tap((updatedAddr) => {
            if (updatedAddr.id > 0) {
              const foundAddrIdx = this.addresses.findIndex(a => a.id === updatedAddr.id);
              if (foundAddrIdx === -1) {
                // was a new address
                this.addresses.push(updatedAddr);
                this.selectedAddress.setValue(updatedAddr.id);
              } else {
                // was an existing address that was updated
                this.addresses[foundAddrIdx] = updatedAddr;
                this.selectedAddress.setValue(updatedAddr.id);
              }
            }
          }),
          mapTo(true)
        );
      }

      const completion$ = defer(() => {
        this._dialog.closeAll();
        this.modifyShippingProfile.setValue(false);
        if (!isCartStateGood) {
          this._snackbar.open(TextContent.BID_CONSISTENCY_ERROR, 'err');
        }
        return this.fetchData();
      });

      const bid$ = defer(() => {
        this._dialog.open(ProcessingModalComponent, {
          disableClose: true,
          data: { message: TextContent.PROCESSING_CHECKOUT }
        });

        const shipAddress: ShippingAddress = {
          id: null,
          title: null,
          firstName: addressFields.firstName || '',
          lastName: addressFields.lastName || '',
          addressLine1: addressFields.addressLine1 || '',
          addressLine2: addressFields.addressLine2 || '',
          city: addressFields.city || '',
          state: addressFields.state || '',
          country: null,
          countryCode: addressFields.countryCode || '',
          zipCode: addressFields.zipCode || '',
        };

        return this._cartService.checkoutCart(shipAddress).pipe(
          tap((resp) => {
            if (typeof resp === 'boolean') {
              isCartStateGood = isCartStateGood && resp;
            }
          }),
          catchError(() => {
            this._snackbar.open(TextContent.BID_SEND_ERROR, 'err');
            return of(false);
          }),
          concatMap(() => completion$)
        );
      });

      // Calculate possible sufficient time for wallet unlock for checkout
      const requiredSecs = 15 * this.cartItems.length;
      const actualSecs = Math.max(30, requiredSecs) + 5;

      return address$.pipe(
        concatMap((refresh) => this._unlocker.unlock({timeout: actualSecs}).pipe(
          concatMap((unlocked) => iif(() => unlocked, bid$, iif(() => refresh, completion$)))
        ))
      );

    });

    const bidModalData: BidModalData = {
      items: this.cartItems.map(ci => ({itemName: ci.title, itemImg: ci.image})),
      pricingSummary: {
        items: this.pricingSummary.items,
        shipping: this.pricingSummary.shipping,
        subtotal: this.pricingSummary.escrow,
        escrow: this.pricingSummary.escrow,
        orderTotal: this.pricingSummary.orderTotal
      },
      shippingDetails: {
        name: `${addressFields.firstName || ''} ${addressFields.lastName || ''}`,
        address: [
          addressFields.addressLine1 || '',
          addressFields.addressLine2 || '',
          addressFields.city || '',
          addressFields.state || '',
          addressFields.zipCode || '',
        ].filter(line => line.length > 0),
        destinationCountryCode: addressFields.countryCode
      }
    };

    this._dialog.open(
      PlaceBidModalComponent,
      {data: bidModalData}
    ).afterClosed().pipe(
      concatMap((doCheckout: boolean | null | undefined) => iif(() => !!doCheckout, checkout$)),
      finalize(() => this.isProcessing = false)
    ).subscribe(
      resp => {
        try {
          if (
            resp &&
            Array.isArray(resp.cartItems) &&
            (resp.cartItems.length === 0) &&
            isCartStateGood
          ) {
            this._snackbar.open(TextContent.BID_SUCCESSFUL);
            this._router.navigate([this.ROUTE_TO_PURCHASED_ORDERS], {queryParams: {selectedBuyTab: 'orders'}});
          }
        } catch (e) {
          // eh?? what happened? -> resp changed.
        }
      }
    );
  }


  updateLocationValue(isoCode: string): void {
    this.selectedLocation.setValue(isoCode);
  }


  removeCartItem(itemId: number): void {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    this._cartService.removeCartItem(itemId).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (success) => {
        if (success) {
          const itemIdx = this.cartItems.findIndex(ci => ci.id === itemId);
          if (itemIdx > -1) {
            this.cartItems.splice(itemIdx, 1);
            this.updateCartExpiryTimer();
            this.updateCartItemPricing();
            this.cartModified.setValue(true);
          }
        } else {
          this._snackbar.open(TextContent.CART_ITEM_REMOVE_ERROR, 'warn');
        }
      }
    );
  }


  clearCart(): void {
    if (this.isProcessing || (this.cartItems.length === 0)) {
      return;
    }
    this.isProcessing = true;

    this._cartService.removeAllCurrentCartItems().pipe(
      concatMap((success) => iif(
        () => success,

        defer(() => {
          this.cartItems = [];
          this.updateCartExpiryTimer();
          this.updateCartItemPricing();
          this.cartModified.setValue(true);
        }),

        defer(() => this.fetchData())
      )),
      finalize(() => {
        this.isProcessing = false;
      })
    ).subscribe();
  }


  private updateCartExpiryTimer(): void {
    this.timerDestroy$.next();

    if (this.cartItems.length === 0) {
      return;
    }

    const now = Date.now() + 1000;
    const expiresSoonTime = 1000 * 60 * 60 * 24;

    let timerTo: number = Number.MAX_SAFE_INTEGER;

    for (const cartItem of this.cartItems) {
      cartItem.errors.expired = cartItem.expiryTime <= now;
      cartItem.errors.expiring = (cartItem.expiryTime > now) && (now >= (cartItem.expiryTime - expiresSoonTime));

      const checkTime = (cartItem.expiryTime - expiresSoonTime) > now ?
        (cartItem.expiryTime - expiresSoonTime) :
        (cartItem.expiryTime > now ? cartItem.expiryTime : Number.MAX_SAFE_INTEGER);

      timerTo = Math.min(timerTo, checkTime);
    }

    if ((timerTo < Number.MAX_SAFE_INTEGER) && (timerTo > Date.now())) {
      timer(timerTo - Date.now()).pipe(
        takeUntil(this.timerDestroy$)
      ).subscribe(
        // subscription shouldn't fire if the takeUntil completion is triggered, preventing a recursive call leak
        () => {
          this.updateCartExpiryTimer();
          this._cdr.detectChanges();
        }
      );
    }
  }


  private fetchData(): Observable<{addresses: ShippingAddress[], cartItems: DisplayedCartItem[]}> {

    const addressLoad$ = this._cartService.fetchSavedAddresses();

     const cartLoad$ = this._cartService.fetchCartItems().pipe(
       map((cartItems: CartItem[]) => {
         return cartItems.map(ci => {
           const dci: DisplayedCartItem = {
             ...ci,
             displayedPrices: {
               item: {
                 whole: ci.price.base.particlStringInteger(),
                 sep: ci.price.base.particlStringSep(),
                 fraction: ci.price.base.particlStringFraction()
               },
               shipping: { whole: '', sep: '', fraction: ''},
               subtotal: { whole: '', sep: '', fraction: ''}
             },
             errors: {
               expired: false,
               expiring: false,
               shipping: false
             }
           };
           return dci;
         });
       })
     );

    return defer(() => forkJoin({
      addresses: addressLoad$,
      cartItems: cartLoad$
    }).pipe(
      catchError(() => {
        this._snackbar.open(TextContent.LOADING_ERROR, 'warn');
        return of({cartItems: [], addresses: []});
      }),
      tap(results => {
        this.cartItems = results.cartItems;
        this.addresses = results.addresses;
        this.updateCartExpiryTimer();
        this.updateCartItemPricing();
        this.cartModified.setValue(true);
      })
    ));
  }


  private updateCartItemPricing(): void {
    const selectedCode = this.selectedLocation.value;

    const totals = {
      items: new PartoshiAmount(0),
      shipping: new PartoshiAmount(0),
      escrow: new PartoshiAmount(0),
      subtotal: new PartoshiAmount(0)
    };

    this.cartItems.forEach(ci => {
      if (selectedCode) {
        ci.errors.shipping = !((ci.shippingLocations.length === 0) || ci.shippingLocations.includes(selectedCode));

        const cartValue = new PartoshiAmount(
          ci.sourceLocation === selectedCode ? ci.price.shippingLocal.particls() : ci.price.shippingIntl.particls()
        );

        totals.items.add(ci.price.base);
        totals.shipping.add(cartValue);

        ci.displayedPrices.shipping.whole = cartValue.particlStringInteger();
        ci.displayedPrices.shipping.sep = cartValue.particlStringSep();
        ci.displayedPrices.shipping.fraction = cartValue.particlStringFraction();

        cartValue.add(ci.price.base);
        ci.displayedPrices.subtotal.whole = cartValue.particlStringInteger();
        ci.displayedPrices.subtotal.sep = cartValue.particlStringSep();
        ci.displayedPrices.subtotal.fraction = cartValue.particlStringFraction();

        totals.subtotal.add(cartValue);
        totals.escrow.add(cartValue.multiply(ci.escrowPercent / 100));

      } else {
        ci.errors.shipping = true;

        ci.displayedPrices.shipping.whole = '';
        ci.displayedPrices.shipping.sep = '';
        ci.displayedPrices.shipping.fraction = '';

        ci.displayedPrices.subtotal.whole = '';
        ci.displayedPrices.subtotal.sep = '';
        ci.displayedPrices.subtotal.fraction = '';
      }
    });

    this.pricingSummary.items.whole = totals.items.particlStringInteger();
    this.pricingSummary.items.sep = totals.items.particlStringSep();
    this.pricingSummary.items.fraction = totals.items.particlStringFraction();

    if (selectedCode) {

      this.pricingSummary.shipping.whole = totals.shipping.particlStringInteger();
      this.pricingSummary.shipping.sep = totals.shipping.particlStringSep();
      this.pricingSummary.shipping.fraction = totals.shipping.particlStringFraction();

      this.pricingSummary.subtotal.whole = totals.subtotal.particlStringInteger();
      this.pricingSummary.subtotal.sep = totals.subtotal.particlStringSep();
      this.pricingSummary.subtotal.fraction = totals.subtotal.particlStringFraction();

      this.pricingSummary.escrow.whole = totals.escrow.particlStringInteger();
      this.pricingSummary.escrow.sep = totals.escrow.particlStringSep();
      this.pricingSummary.escrow.fraction = totals.escrow.particlStringFraction();

      totals.subtotal.add(totals.escrow);
      this.pricingSummary.orderTotal.whole = totals.subtotal.particlStringInteger();
      this.pricingSummary.orderTotal.sep = totals.subtotal.particlStringSep();
      this.pricingSummary.orderTotal.fraction = totals.subtotal.particlStringFraction();

    } else {
      this.pricingSummary.shipping = { whole: '', sep: '', fraction: ''};
      this.pricingSummary.subtotal = { whole: '', sep: '', fraction: ''};
      this.pricingSummary.escrow = { whole: '', sep: '', fraction: ''};
      this.pricingSummary.orderTotal = { whole: '', sep: '', fraction: ''};
    }
  }

}
