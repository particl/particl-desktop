import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { Listing } from '../../../core/market/api/listing/listing.model';


@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent {

  private log: any = Log.create('favorite.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;
  @Input() detail: boolean = true;
  constructor(
    public favorites: FavoritesService
  ) {}

  toggle() {
    this.favorites.toggle(this.listing);
  }

  get isFavorited(): boolean {
    return this.listing && this.favorites.cache.isFavorited(this.listing);
  }
}
