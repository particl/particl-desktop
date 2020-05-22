import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';


interface SortCriteria {
  text: string;
  value: string;
}



@Component({
  selector: 'market-sell-templates',
  templateUrl: './sell-templates.component.html',
  styleUrls: ['./sell-templates.component.scss']
})
export class SellTemplatesComponent implements OnInit {


  readonly sortCriteria: {title: string; value: string}[] = [
    {title: 'By Title', value: 'item_informations.title'},
    {title: 'By Creation', value: 'created_at'},
    {title: 'By Updated', value: 'updated_at'}
  ];

  readonly filterStatusCriteria: {title: string; value: string}[] = [
    {title: 'All', value: ''},
    {title: 'Unpublished', value: '0'},
    {title: 'Published', value: '1'},
  ];


  searchQuery: FormControl = new FormControl();
  sortOrder: FormControl = new FormControl();
  filterStatus: FormControl = new FormControl();


  constructor(

  ) {}


  ngOnInit() {
    this.setControlDefaults();
  }


  resetControls() {
    this.setControlDefaults();
  }



  private setControlDefaults() {
    this.searchQuery.setValue('');
    this.sortOrder.setValue('item_informations.title');
    this.filterStatus.setValue('');
  }
}
