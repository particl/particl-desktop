import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-overview-listings',
  templateUrl: './overview-listings.component.html',
  styleUrls: ['./overview-listings.component.scss']
})
export class OverviewListingsComponent implements OnInit {

  // filters
  countries: FormControl = new FormControl();
  countryList: Array<string> = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Moon'];

  // TODO? "Select with option groups" - https://material.angular.io/components/select/overview#creating-groups-of-options
  categories: FormControl = new FormControl();
  categoryList: Array<string> = ['Electronics', 'Hobby', 'Health & Beauty', 'Toys', 'Gardening', 'Food', 'Digital', 'Whatever else'];

  // sorting
  sortings = [
    {value: 'newest', viewValue: 'Newest'},
    {value: 'popular', viewValue: 'Popular'},
    {value: 'price-asc', viewValue: 'Cheapest'},
    {value: 'price-des', viewValue: 'Most expensive'}
  ];

  listings: Array<any> = [
    '1',
    '2'
  ];

  constructor() {
    console.warn('overview created');
   }

  ngOnInit() {
    console.log('overview created');
  }

}
