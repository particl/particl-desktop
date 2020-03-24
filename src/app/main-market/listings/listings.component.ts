import { Component } from '@angular/core';


@Component({
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss']
})
export class ListingsComponent {

  // loading
  public isLoading: boolean = false; // small progress bars
  //public isLoadingBig: boolean = true; // big animation
  public isFiltering: boolean = false;

  // filters
  search: string;

}
