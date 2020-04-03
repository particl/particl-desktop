import { Component } from '@angular/core';


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
