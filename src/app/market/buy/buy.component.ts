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

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss']
})
export class BuyComponent implements OnInit {

  static stepperIndex: number = 0;
  @ViewChild('stepper') stepper: MatStepper;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['cart', 'orders', 'favourites'];

  /* https://material.angular.io/components/stepper/overview */
  public cartFormGroup: FormGroup;
  public shippingFormGroup: FormGroup;

  public order_sortings: Array<any> = [
    { title: 'By creation date', value: 'date-created' },
    { title: 'By update date',   value: 'date-update'  },
    { title: 'By status',        value: 'status'       },
    { title: 'By item name',     value: 'item-name'    },
    { title: 'By category',      value: 'category'     },
    { title: 'By quantity',      value: 'quantity'     },
    { title: 'By price',         value: 'price'        }
  ];

  // TODO: disable radios for 0 amount-statuses
  public order_filtering: Array<any> = [
    { title: 'All orders', value: 'all',     amount: '3' },
    { title: 'Bidding',    value: 'bidding', amount: '1' },
    { title: 'In escrow',  value: 'escrow',  amount: '0' },
    { title: 'Shipped',    value: 'shipped', amount: '1' },
    { title: 'Sold',       value: 'sold',    amount: '1' }
  ];

  // Orders
  public orders: Array<any> = [
    {
      name: 'NFC-enabled contactless payment perfume',
      hash: 'AGR', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg6', // TODO: assign random hash_bg (bg1-bg16)
      status: 'bidding',
      status_info: 'Waiting for seller to manually accept your bid',
      action_icon: 'part-date',
      action_button: 'Waiting for seller',
      action_tooltip: '',
      action_disabled: true,
      show_escrow_txdetails: false,
    },
    {
      name: 'Development Buff (2 week subscription)',
      hash: 'FG2', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg12', // TODO: assign random hash_bg (bg1-bg16)
      status: 'awaiting',
      status_info: 'Seller accepted your bid – please proceed to making the payment (this will lock the funds to escrow)',
      action_icon: 'part-check',
      action_button: 'Make payment',
      action_tooltip: 'Pay for your order & escrow',
      action_disabled: false,
      show_escrow_txdetails: false,
    },
    {
      name: 'My basic listing template',
      hash: '5EH', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg2', // TODO: assign random hash_bg (bg1-bg16)
      status: 'escrow',
      status_info: 'Funds locked in escrow, waiting for Seller to ship the order',
      action_icon: 'part-date',
      action_button: 'Waiting for shipping',
      action_tooltip: '',
      action_disabled: true,
      show_escrow_txdetails: true,
    },
    {
      name: 'Fresh product (2 kg)',
      hash: 'SPP', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg11', // TODO: assign random hash_bg (bg1-bg16)
      status: 'shipping',
      status_info: 'Order has been shipped – when you receive it, mark it as delivered and escrow will be released automatically',
      action_icon: 'part-check',
      action_button: 'Mark as delivered',
      action_tooltip: 'Confirm that you\'ve received the order',
      action_disabled: false,
      show_escrow_txdetails: true,
    },
    {
      name: 'Fresh product (2 kg)',
      hash: '1ER', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg8', // TODO: assign random hash_bg (bg1-bg16)
      status: 'complete',
      status_info: 'Successfully finalized order',
      action_icon: 'part-check',
      action_button: 'Order complete',
      action_tooltip: '',
      action_disabled: true,
      show_escrow_txdetails: true,
    },
  ];

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
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _profileService: ProfileService,
    private listingService: ListingService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    public countryList: CountryListService,
    private market: MarketService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    this.formBuild();

    this.getProfile();

    this.getCart();

    this.favoritesService.updateListOfFavorites();
    this.getFavorites();
  }

  formBuild() {
    this.cartFormGroup = this._formBuilder.group({
      firstCtrl: ['']
    });

    this.shippingFormGroup = this._formBuilder.group({
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
          temp.push(new Listing(listing));
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
    this._router.navigate(['/market/overview']);
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

    let upsert: Function = this._profileService.updateShippingAddress.bind(this);

    if (this.profile.ShippingAddresses.length === 0) {
      upsert = this._profileService.addShippingAddress.bind(this);
    }
    console.log(this.shippingFormGroup.value);
    upsert(this.shippingFormGroup.value).take(1).subscribe(address => {
      this.getProfile();
    });

  }

  getProfile(): void{
    this._profileService.get(1).take(1).subscribe(
      profile => {
        this.profile = profile;
        console.log('--- profile address ----');
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

  // TODO: remove type any
  fillAddress() {
    
    //this.shippingFormGroup.setValue(address);
  }

  placeOrder() {
    this.getItemHash()
    // item hashes
    // const itemhash: string = JSON.stringify(this.getItemHash());
    // this.market.call('bid', ['send', itemhash, this.profile.address]).subscribe((res) => {
    //
    //   this.snackbarService.open('Order has been successfully placed');
    //   // change tab
    //   this.selectedTab = 1;
    //
    // }, (error) => {
    //   console.error('>>>', error);
    // });
  }

  // @TODO create asyc function for loop calling API
  getItemHash() {
    // let itemhash: Array<any> = [];
    this.cart.cartDbObj.forEach((cart: any, index) => {
      if (cart.ListingItem && cart.ListingItem.hash) {
        // itemhash.push(cart.ListingItem.hash)

        this.market.call('bid', ['send', cart.ListingItem.hash, this.profile.address]).subscribe((res) => {

          this.snackbarService.open('Order has been successfully placed');
          // change tab
         // this.selectedTab = 1;
        }
      }
    });
    // return itemhash;
  }
}


