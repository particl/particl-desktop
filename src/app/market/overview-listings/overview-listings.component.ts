import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview-listings',
  templateUrl: './overview-listings.component.html',
  styleUrls: ['./overview-listings.component.scss']
})
export class OverviewListingsComponent implements OnInit {

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
