import { Component, OnInit, ViewChild, DoCheck } from '@angular/core';
import { MatStepper } from '@angular/material';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Cart } from 'app/core/market/api/cart/cart.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { MarketService } from '../../core/market/market.service';

import { ShippingDetails } from '../shared/shipping-details.model';
import { SnackbarService } from '../../core/snackbar/snackbar.service';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss']
})
export class BuyComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['cart', 'orders', 'favourites'];

  // Order type
  orderType: string = 'buy';
  /* https://material.angular.io/components/stepper/overview */
  public cartFormGroup: FormGroup;
  public shippingFormGroup: FormGroup;

  public filters: any = {
    search: undefined,
    sort:   undefined,
    status: undefined
  };

  public profile: any = { };

  /* cart */
  public cart: Cart;

  /* favs */
  public favorites: Array<Listing> = [];

  constructor(
    // 3rd party
    private formBuilder: FormBuilder,
    private router: Router,
    // core
    private snackbarService: SnackbarService,
    private rpcState: RpcStateService,
    private modals: ModalsService,
    // market
    private market: MarketService,
    private profileService: ProfileService,
    private listingService: ListingService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    public countryList: CountryListService,
    private bid: BidService,

  ) { }

  ngOnInit() {
    this.formBuild();

    this.getProfile();

    this.getCart();

    this.favoritesService.updateListOfFavorites();
    this.getFavorites();
  }

  formBuild() {
    this.cartFormGroup = this.formBuilder.group({
      firstCtrl: ['']
    });

    this.shippingFormGroup = this.formBuilder.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city:         ['', Validators.required],
      state:        [''],
      country:      ['', Validators.required],
      zipCode:      ['', Validators.required]
    });
  }

  getFavorites() {
    this.favoritesService.getFavorites().subscribe(favorites => {
      const temp: Array<Listing> = new Array<Listing>();
      favorites.forEach(favorite => {
        this.listingService.get(favorite.listingItemId).take(1).subscribe(listing => {
          temp.push(listing);
          // little cheat here, because async behavior
          // we're setting the pointer to our new temp array every time we receive
          // a listing.
          this.favorites = temp;
        });
      });
    });
  }

  clear(): void {
    this.filters();
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  /* cart */

  goToListings(): void {
    this.router.navigate(['/market/overview']);
  }

  removeFromCart(shoppingCartId: number): void {
    this.cartService.removeItem(shoppingCartId).take(1)
      .subscribe(res => this.getCart());
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe(res => this.getCart());
  }

  getCart(): void {
    this.cartService.getCart().take(1).subscribe(cart => {
      this.cart = cart;
    });
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

  getProfile(): void{
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
    if(this.shippingFormGroup) {
      return this.shippingFormGroup.get(field).value;
    }
    return '';
  }

  placeOrder() {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.bid.order.bind(this, this.cart, this.profile)});
    } else {
      // wallet already unlocked
      this.bid.order(this.cart, this.profile);
    }
  }

}


