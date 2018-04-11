import {Component, Input, OnInit} from '@angular/core';
import { Bid } from '../../../../core/market/api/bid/bid.model';
import { ListingService } from '../../../../core/market/api/listing/listing.service';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Input() order: Bid;

  constructor(
    private listingService: ListingService
  ) { }

  ngOnInit() {
    this.getItemDetails()
  }

  getItemDetails() {
    this.listingService.get(this.order.listingItemId).subscribe(response => {
     console.log(response);
     this.order.listing = response;
    });
  }

}
