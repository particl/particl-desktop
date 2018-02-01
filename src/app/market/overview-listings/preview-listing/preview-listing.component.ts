import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})
export class PreviewListingComponent implements OnInit {

  @Input() listing: any;

  constructor() { }

  ngOnInit() {
  }

}
