import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-sell-questions',
  templateUrl: './sell-questions.component.html',
  styleUrls: ['./sell-questions.component.scss']
})
export class SellQuestionsComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');

  filters: any = {
    search:   ''
  };

  listing_filtering_market: Array<any> = [
    { title: 'All Markets',     value: 'one' },
    { title: 'Particl Open Marketplace',     value: 'two' },
    { title: 'Sneaky Market',   value: 'three' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
