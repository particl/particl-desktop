import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-overview-listings',
  templateUrl: './overview-listings.component.html',
  styleUrls: ['./overview-listings.component.scss']
})
export class OverviewListingsComponent implements OnInit {

  // filters
  countries = new FormControl();
  countryList = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Moon'];

  // TODO? "Select with option groups" - https://material.angular.io/components/select/overview#creating-groups-of-options
  categories = new FormControl();
  categoryList = ['Electronics', 'Hobby', 'Health & Beauty', 'Toys', 'Gardening', 'Food', 'Digital', 'Whatever else'];

  listings: Array<any> = [
    "1",
    "2"
  ];

  constructor() {
    console.warn("overview created");
   }

  ngOnInit() {
    console.log("overview created");
  }

}
