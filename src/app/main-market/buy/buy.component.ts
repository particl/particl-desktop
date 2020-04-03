import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

// ----- ↓↓↓ ORDERS component ↓↓↓ ----- //
export interface Filter {
  value: string;
  title: string;
  count: string;
}
// ----- ↑↑↑ ORDERS component ↑↑↑ ----- //

@Component({
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss']
})
export class BuyComponent {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['cart', 'orders', 'favourites'];

  // ----- ↓↓↓ ORDERS component ↓↓↓ ----- //
  searchQuery: FormControl = new FormControl('');
  filterQuery: FormControl = new FormControl('all');

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
  // ----- ↑↑↑ ORDERS component ↑↑↑ ----- //

  public filters: any = {
    search: undefined,
    sort:   undefined,
    status: undefined
  };




  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
