import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-buy-questions',
  templateUrl: './buy-questions.component.html',
  styleUrls: ['./buy-questions.component.scss']
})
export class BuyQuestionsComponent implements OnInit {

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
