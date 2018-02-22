import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Category } from 'app/core/market/api/category.model';

interface ISorting {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-overview-listings',
  templateUrl: './overview-listings.component.html',
  styleUrls: ['./overview-listings.component.scss']
})
export class OverviewListingsComponent implements OnInit, OnDestroy {

  log: any = Log.create('overview-listings.component');
  private destroyed: boolean = false;

  // filters
  countries: FormControl = new FormControl();
  countryList: Array<string> = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Moon'];

  // TODO? "Select with option groups" - https://material.angular.io/components/select/overview#creating-groups-of-options
  categories: FormControl = new FormControl();
  categoryList: Array<string> = [];

  _t: Array<any>;
  _rootCategoryList: Category = new Category({});

  // sorting
  sortings: Array<ISorting> = [
    {value: 'newest', viewValue: 'Newest'},
    {value: 'popular', viewValue: 'Popular'},
    {value: 'price-asc', viewValue: 'Cheapest'},
    {value: 'price-des', viewValue: 'Most expensive'}
  ];

  listings: Array<string> = [
    'Product name',
    'This one is a little bit longer than others',
    'Sweet gizmo',
    'Pack of lovely stuff',
    'Box of things',
    'Pair of pears',
    'Cups (couple)',
    'Digital 1011'
  ];

  constructor(
    private market: MarketService,
    private marketState: MarketStateService
  ) {
    console.warn('overview created');
   }

  ngOnInit() {
    console.log('overview created');
    
    this.marketState.observe('category')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      list => this.updateCategories(list));
  }

  updateCategories(list) {
    this.log.d('Updating category list');
    this.log.d(list);
    this.log.d(this._t);
    this._t = list;
    this._rootCategoryList = new Category(list);
    this.categoryList = this._rootCategoryList.getSubCategoryNames();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
