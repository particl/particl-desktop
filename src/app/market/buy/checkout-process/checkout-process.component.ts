import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Log } from 'ng2-logger';

import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { Cart } from 'app/core/market/api/cart/cart.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { MarketService } from '../../../core/market/market.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsService } from 'app/modals/modals.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { PlaceOrderComponent } from '../../../modals/place-order/place-order.component';

@Component({
  selector: 'app-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss']
})
export class CheckoutProcessComponent implements OnInit {

  private log: any = Log.create('buy.component: ' + Math.floor((Math.random() * 1000) + 1));

  @Output() onOrderPlaced: EventEmitter<number> = new EventEmitter<number>();
  /* https://material.angular.io/components/stepper/overview */
  public cartFormGroup: FormGroup;
  public shippingFormGroup: FormGroup;

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
    private bid: BidService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.formBuild();

    this.getProfile();

    this.getCart();

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
      newShipingProfileName: ['']
    });
  }

  /* cart */

  goToListings(): void {
    this.router.navigate(['/market/overview']);
  }

  removeFromCart(shoppingCartId: number): void {
    this.cartService.removeItem(shoppingCartId).take(1)
      .subscribe(this.getCart);
  }

  clearCart(isSnack: boolean = true): void {
    this.cartService.clearCart().subscribe(res => {
      if (isSnack) {
        this.snackbarService.open('All Items Cleared From Cart');
      }
      this.getCart()
    });
  }

  getCart(): void {
    this.cartService.getCart().take(1).subscribe(cart => this.cart = cart);
  }

  /* shipping */

  updateShippingAddress(): void {
    if (!this.profile) {
      this.snackbarService.open('Profile was not fetched!');
      return;
    }

    let upsert: Function = this.profileService.updateShippingAddress.bind(this);

    if (this.profile.ShippingAddresses.length === 0) {
      upsert = this.profileService.addShippingAddress.bind(this);
    }
    console.log(this.shippingFormGroup.value);
    upsert(this.shippingFormGroup.value).take(1).subscribe(address => {
      this.getProfile();
    });

  }

  getProfile(): void {
    this.profileService.get(1).take(1).subscribe(
      profile => {
        this.profile = profile;
        console.log('--- profile address ----');
        console.log(profile);
        const addresses = profile.ShippingAddresses;
        if (addresses.length > 0) {
          this.shippingFormGroup.patchValue(addresses[0]);
        }
      });
  }

  valueOf(field: string) {
    return this.shippingFormGroup ? this.shippingFormGroup.get(field).value : '';
  }

  placeOrderModal(): void {
    let dialogRef = this.dialog.open(PlaceOrderComponent);
  }

  /*
  // moved to place-order.component.ts
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

      this.snackbarService.open('Order has been successfully placed');
      this.onOrderPlaced.emit(1);
    }, (error) => {
      this.log.d(`Error while placing an order`);
    });
  }
  */
}
