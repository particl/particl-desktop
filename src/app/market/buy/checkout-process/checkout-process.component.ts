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
import { ShippingDetails } from '../../shared/shipping-details.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { MarketService } from '../../../core/market/market.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsService } from 'app/modals/modals.service';
import { MatDialog } from '@angular/material';
import { PlaceOrderComponent } from '../../../modals/place-order/place-order.component';
import { CheckoutProcessCacheService } from 'app/core/market/market-cache/checkout-process-cache.service';

@Component({
  selector: 'app-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss']
})
export class CheckoutProcessComponent implements OnInit, OnDestroy {

  private log: any = Log.create('buy.component: ' + Math.floor((Math.random() * 1000) + 1));

  @Output() onOrderPlaced: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('stepper') stepper: MatStepper;
  public cartFormGroup: FormGroup;
  public shippingFormGroup: FormGroup;
  public newShipping: boolean;
  public selectedAddress: ShippingDetails;
  public selectedIndex: number = 0;
  public isStepperLinear: boolean = true;
  public isShippingDetailsStepCompleted: boolean = false;

  public profile: any = {};

  /* cart */
  public cart: Cart;

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
    public checkoutProcessCacheService: CheckoutProcessCacheService,
    private bid: BidService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.formBuild();

    this.getProfile();

    this.cartService.list().subscribe(cart => this.cart = cart);
  }

  ngOnDestroy() {
    this.setShippingCache();
  }

  // @TODO create separate service for checkout process.
  setShippingCache() {
    this.updateSteperIndex();
    this.checkoutProcessCacheService.shippingDetails = this.shippingFormGroup.value;
    if (this.selectedAddress) {
      this.checkoutProcessCacheService.shippingDetails.id = this.selectedAddress.id
    }
  }

  formBuild() {
    this.cartFormGroup = this.formBuilder.group({
      firstCtrl: ['']
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
      title: ['']
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

    let upsert: Function;
    if (this.profile.ShippingAddresses.length === 0 || this.newShipping === true) {
      upsert = this.profileService.addShippingAddress.bind(this);
    } else {
      this.shippingFormGroup.value.id = this.selectedAddress.id;
      upsert = this.profileService.updateShippingAddress.bind(this);
    }

    this.setShippingCache();
    upsert(this.shippingFormGroup.value).take(1).subscribe(address => {
      this.getProfile();
    });

  }

  setValue(address: ShippingDetails) {
    this.shippingFormGroup.patchValue(address);
  }

  getProfile(): void {
    this.profileService.get(1).take(1).subscribe(
      profile => {
        this.profile = profile;
        const addresses = profile.ShippingAddresses.filter((address) => address.type === "SHIPPING_OWN");
        if (addresses.length > 0) {
          this.setSteperIndex();
          this.selectedAddress = (
            this.checkoutProcessCacheService.shippingDetails
          ) ? (
            this.checkoutProcessCacheService.shippingDetails
          ) : addresses[0];
          this.setValue(this.selectedAddress);
        }
      });
  }

  valueOf(field: string) {
    return this.shippingFormGroup ? this.shippingFormGroup.get(field).value : '';
  }

  placeOrderModal(): void {
    const dialogRef = this.dialog.open(PlaceOrderComponent);
    dialogRef.componentInstance.type = 'place';
    dialogRef.componentInstance.isConfirmed.subscribe(() => this.placeOrder());
  }

  placeOrder() {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.bidOrder.bind(this)});
    } else {
      // wallet already unlocked
      this.bidOrder();
    }
  }

  bidOrder() {
    this.bid.order(this.cart, this.profile).subscribe((res) => {
      this.clearCart(false);
      this.clearCache();
      this.snackbarService.open('Order has been successfully placed');
      this.onOrderPlaced.emit(1);
    }, (error) => {
      this.log.d(`Error while placing an order`);
    });
  }

  clearCache() {
    this.checkoutProcessCacheService.stepper = 0;
    this.checkoutProcessCacheService.shippingDetails = new ShippingDetails()
  }

  setSteperIndex() {
    // set manually shipping details step completed.
    if (this.checkoutProcessCacheService.stepper === 2) {
      this.isStepperLinear = false;
      this.isShippingDetailsStepCompleted = true;
    }

    this.selectedIndex = this.checkoutProcessCacheService.stepper;
  }

  updateSteperIndex() {
    this.checkoutProcessCacheService.stepper = this.stepper.selectedIndex;
  }
}
