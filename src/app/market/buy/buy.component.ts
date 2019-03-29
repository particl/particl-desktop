import { Component, OnInit } from '@angular/core';

import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Listing } from 'app/core/market/api/listing/listing.model';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { take } from 'rxjs/operators';



@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss']
})
export class BuyComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['cart', 'orders', 'favourites'];

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
    private listingService: ListingService,
    private favoritesService: FavoritesService,
    public countryList: CountryListService
  ) { }

  ngOnInit() {
    this.favoritesService.cache.update();
    this.load();
  }

  load() {
    this.favoritesService.cache.getFavorites().subscribe(favorites => {
      const temp: Listing[] = [];
      // intialize when there is no favorites and no need for map
      if (favorites.length === 0 ) {
        this.favorites = [];
        return;
      }

      favorites.forEach(favorite => {
        this.listingService.get(favorite.listingItemId).pipe(take(1)).subscribe(listing => {
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

}


