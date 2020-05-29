import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';


interface Filter {
  value: string;
  title: string;
  count: string;
}

@Component({
  selector: 'market-sell-orders',
  templateUrl: './sell-orders.component.html',
  styleUrls: ['./sell-orders.component.scss']
})
export class SellOrdersComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');
  filterQuery: FormControl = new FormControl('all');
  filterMarket: FormControl = new FormControl();

  statusFilters: Filter[] = [
    {value: 'all', title: 'All orders', count: '11'},
    {value: 'bids', title: 'Bidding', count: '1'},
    {value: 'awaiting', title: 'Awaiting payment', count: '2'},
    {value: 'escrow', title: 'Escrow pending', count: '0'},
    {value: 'packaging', title: 'Packaging', count: '1'},
    {value: 'shipping', title: 'Shipping', count: '0'},
    {value: 'complete', title: 'Completed', count: '3'},
    {value: 'rejected', title: 'Rejected', count: '1'},
    {value: 'cancelled', title: 'Cancelled', count: '3'}
  ];

  // @FIXME: implement filtering based on Markets where the Product is published
  readonly publishedOnMarketCriteria: {title: string; value: string}[] = [
    {title: 'All Markets', value: ''},
    {title: 'Particl Open Marketplace', value: 'open-marketplace'},
    {title: 'Sneaky Market', value: 'sneaky'},
  ];

  public filters: any = {
    search: undefined,
    sort:   undefined,
    status: undefined
  };

  constructor() { }

  ngOnInit() {
  }

}
