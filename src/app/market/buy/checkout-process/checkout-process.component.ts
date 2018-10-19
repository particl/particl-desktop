import {
  Component, EventEmitter, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Log } from 'ng2-logger';
import { MatStepper } from '@angular/material';

import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { Cart } from 'app/core/market/api/cart/cart.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { MarketService } from '../../../core/market/market.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { MatDialog } from '@angular/material';
import { PlaceOrderComponent } from '../../../modals/market-place-order/place-order.component';
import { CheckoutProcessCacheService } from 'app/core/market/market-cache/checkout-process-cache.service';
import { Address } from 'app/core/market/api/profile/address/address.model';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

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

  public profile: Profile;
  public selectedCountry: Country;

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

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    private modals: ModalsHelperService,
    // market
    private market: MarketService,
    private profileService: ProfileService,
    private cartService: CartService,
    public countryList: CountryListService,
    public cache: CheckoutProcessCacheService,
    private bid: BidService,
    private listCache: PostListingCacheService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.formBuild();

    this.getProfile();

    this.cartService.list()
      .takeWhile(() => !this.destroyed)
      .subscribe((cart: Cart) => {
        /** If we add an item to cart and move the checkout process and complete first two steps,
         * then we are on the third step.
         * After then I change my mind and remove the all current item from my cart one by one,
         * then still I can jump to other steps in the checkout process.
         * We can handle that scenario with the stepper reset `this.resetStepper();`
        **/

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
    this.cartService.removeItem(shoppingCartId).take(1).subscribe(res => {
      this.snackbarService.open('Item successfully removed from cart');
    }, error => this.snackbarService.open(error));
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

    this.country = this.shippingFormGroup.value.country || '';

    let upsert: Function;

    if (this.shippingFormGroup.value.newShipping === true) {
      // Add or update saved shipping address

      if (this.selectedAddress && this.selectedAddress.id) {
        // Update currently selected shiping profile
        this.log.d('Updating address with id: ' + this.selectedAddress.id + ' for profile!');
        this.shippingFormGroup.value.id = this.selectedAddress.id;
        upsert = this.profileService.address.update.bind(this);
      } else if (!this.selectedAddress) {
        // Add new shipping profile
        this.log.d('Creating new address for profile!');
        upsert = this.profileService.address.add.bind(this);
      }
    }

    if (upsert !== undefined) {
      const address = this.shippingFormGroup.value as Address;
      upsert(address).take(1).subscribe(addressWithId => {
        // update the cache
        this.allowGoingBack();
        this.storeCache();

        // we need to retrieve the id of  address we added (new)
        this.select(addressWithId);

      });
    } else {
      this.allowGoingBack();
      this.storeCache();
    }
  }

  setDefaultCountry(countryCode: string) {
    this.selectedCountry = this.countryList.getCountryByRegion(countryCode);
  }

  onCountryChange(country: Country): void {
    this.shippingFormGroup.patchValue({
      country: (country ? country.iso : null)
    })
  }

  select(address: Address) {
    this.log.d('Selecting address with id: ' + address.id);
    this.selectedAddress = address;
    this.shippingFormGroup.value.id = address.id;
    this.setDefaultCountry(address.country);
    this.shippingFormGroup.patchValue(address);
  }

  clear() {
    this.shippingFormGroup.reset();
    // this.cartService.clear().subscribe();
    this.cache.clear();
    this.getCache();
  }

  clearForm(): void {
    this.selectedCountry = undefined;
    this.selectedAddress = new Address();
    this.shippingFormGroup.reset();
  }

  get addressNotSelected(): boolean {
    return Object.keys(this.selectedAddress).length > 0
  }

  getProfile(): void {
    this.profileService.default().take(1).subscribe(
      (profile: any) => {
        this.log.d('checkout got profile:')
        this.profile = profile;
        console.log(this.profile);
        const addresses = profile.shippingAddresses;
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
    this.modals.unlock({timeout: 30}, (status) => this.bidOrder());
  }

  bidOrder() {
    const addressId: number = this.selectedAddress && this.selectedAddress.id ? +this.selectedAddress.id : -1;

    // Extract the shipping address details here (always use the address entered by the user in this.shippingFormGroup)
    const shippingInfo: any = {
      'shippingAddress.firstName': '',
      'shippingAddress.lastName': '',
      'shippingAddress.addressLine1': '',
      'shippingAddress.addressLine2': '',
      'shippingAddress.city': '',
      'shippingAddress.state': '',
      'shippingAddress.zipCode': '',
      'shippingAddress.country': '',
    };

    const sourceObject = this.shippingFormGroup.value;
    for (const key of Object.keys(shippingInfo)) {
      const existingValue = sourceObject[key.replace('shippingAddress.', '')];
      if (existingValue) {
        shippingInfo[key] = existingValue;
      }
    }

    this.bid.order(this.cart, this.profile, shippingInfo).then((res) => {
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
