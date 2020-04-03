import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-listing',
  templateUrl: './new-listing.component.html',
  styleUrls: ['./new-listing.component.scss']
})
export class NewListingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  isExistingTemplate() {
    return false; // FIXME, I'm useless :)
  }

}
