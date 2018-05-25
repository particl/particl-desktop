import {
  Component, EventEmitter, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Log } from 'ng2-logger';
import { MatStepper } from '@angular/material';

import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { Cart } from 'app/core/market/api/cart/cart.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { MarketService } from '../../../core/market/market.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsService } from 'app/modals/modals.service';
import { MatDialog } from '@angular/material';
import { PlaceOrderComponent } from '../../../modals/place-order/place-order.component';
import { CheckoutProcessCacheService } from 'app/core/market/market-cache/checkout-process-cache.service';
import { Address } from 'app/core/market/api/profile/address/address.model';

@Component({
  selector: 'app-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss']
})
export class CheckoutProcessComponent implements OnInit, OnDestroy {

  private log: any = Log.create('buy.component: ' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  @Output() onOrderPlaced: EventEmitter<number> = new EventEmitter<number>();


  public selectedAddress: Address;

  public profile: any = {};

  /* cart */
  public cart: Cart;

  /* Stepper stuff */
  @ViewChild('stepper') stepper: MatStepper;
  // stepper form data
  public cartFormGroup: FormGroup;
  public shippingFormGroup: FormGroup;
  public country: string = '';


  constructor(// 3rd party
    private formBuilder: FormBuilder,
    private router: Router,
    // core
    private snackbarService: SnackbarService,
    private rpcState: RpcStateService,
    private modals: ModalsService,
    // market
    private market: MarketService,
    private profileService: ProfileService,
    private cartService: CartService,
    public countryList: CountryListService,
    public cache: CheckoutProcessCacheService,
    private bid: BidService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.formBuild();

    this.country = this.shippingFormGroup.value.country || '';

    this.getProfile();

    this.cartService.list()
      .takeWhile(() => !this.destroyed)
      .subscribe((cart: Cart) => {
        // note: this.cart & cart, two different ones!
        if (this.cart && cart.countOfItems === 0) {
          this.resetStepper();
        }
        this.cart = cart
        this.cartFormGroup.patchValue({ itemsInCart: this.cart.countOfItems });
      });

    this.getCache();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.storeCache();
  }

  setCartItemCount() {
    this.cartFormGroup.patchValue({ itemsInCart: this.cart.countOfItems })
  }

  resetStepper() {
    this.stepper.reset();
    this.stepper.linear = true;
  }

  formBuild() {

    // itemsInCart validate, that cart should be have at least one item in cart to proceed checkout process.

    this.cartFormGroup = this.formBuilder.group({
      firstCtrl: [''],
      itemsInCart: [0, Validators.min(1)]
    });

    this.shippingFormGroup = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [''],
      country: ['', Validators.required],
      zipCode: ['', Validators.required],
      newShipping: [''],
      title: ['', Validators.required]
    });
  }

  /* cart */

  goToListings(): void {
    this.router.navigate(['/market/overview']);
  }

  removeFromCart(shoppingCartId: number): void {
    this.cartService.removeItem(shoppingCartId).take(1).subscribe();
  }

  clearCart(isSnack: boolean = true): void {
    this.cartService.clear().subscribe(res => {
      if (isSnack) {
        this.snackbarService.open('All Items Cleared From Cart');
      }
    });
  }

  /* shipping */

  updateShippingAddress(): void {
    if (!this.profile) {
      this.snackbarService.open('Profile was not fetched!');
      return;
    }

    if (this.shippingFormGroup.value.newShipping === true) {
      this.log.d('Creating new address for profile!');
    } else {
      this.log.d('Updating address with id: ' + this.selectedAddress.id + ' for profile!');
    }

    let upsert: Function;
    if (this.profile.ShippingAddresses.length === 0 || this.shippingFormGroup.value.newShipping === true) {
      upsert = this.profileService.address.add.bind(this);
    } else {
      this.shippingFormGroup.value.id = this.selectedAddress.id;
      upsert = this.profileService.address.update.bind(this);
    }

    const address = this.shippingFormGroup.value as Address;
    upsert(address).take(1).subscribe(addressWithId => {
      // update the cache
      this.allowGoingBack();
      this.storeCache();

      // we need to retrieve the id of  address we added (new)
      this.select(addressWithId);

    });

  }

  select(address: Address) {
    this.log.d('Selecting address with id: ' + address.id);
    this.selectedAddress = address;
    this.shippingFormGroup.value.id = address.id;
    this.shippingFormGroup.patchValue(address);
  }

  clear() {
    this.shippingFormGroup.reset();
    this.cartService.clear().subscribe();
    this.cache.clear();
    this.getCache();
  }

  getProfile(): void {
    this.profileService.default().take(1).subscribe(
      (profile: any) => {
        this.log.d('checkout got profile:')
        console.log(profile);
        this.profile = profile;
        const addresses = profile.ShippingAddresses.filter((address) => address.title && address.type === 'SHIPPING_OWN');
        if (addresses.length > 0) {
          this.select(this.cache.address || addresses[0]);
        }
      });
  }


  /*
    On click confirm order.
  */

  placeOrderModal(): void {
    const dialogRef = this.dialog.open(PlaceOrderComponent);
    dialogRef.componentInstance.type = 'place';
    dialogRef.componentInstance.isConfirmed.subscribe(() => this.placeOrder());
  }

  placeOrder() {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', { forceOpen: true, timeout: 30, callback: this.bidOrder.bind(this) });
    } else {
      // wallet already unlocked
      this.bidOrder();
    }
  }

  bidOrder() {
    const addressId = this.selectedAddress.id;
    this.bid.order(this.cart, this.profile, addressId).subscribe((res) => {

      this.clear();

      this.snackbarService.open('Order has been successfully placed');
      this.onOrderPlaced.emit(1);
    }, (error) => {
      this.snackbarService.open(error, 'warn');
      this.log.d(`Error while placing an order`);
    });
  }



  /*
    Cache functions
  */

  getCache(): void {
    // set stepper to values of cache
    this.stepper.selectedIndex = this.cache.selectedIndex;
    this.stepper.linear = this.cache.linear;
  }

  storeCache(): void {
    this.cache.selectedIndex = this.stepper.selectedIndex;
    this.cache.linear = this.stepper.linear;

    this.cache.address = this.shippingFormGroup.value;
    if (this.selectedAddress) {
      this.cache.address.id = this.selectedAddress.id
    }
  }

  allowGoingBack() {
    this.stepper.linear = false;
  }

}
