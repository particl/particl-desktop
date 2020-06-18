import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-batch-publish-modal',
  templateUrl: './batch-publish-modal.component.html',
  styleUrls: ['./batch-publish-modal.component.scss']
})
export class BatchPublishModalComponent implements OnInit {

  currentIdentity: string = '';
  currentBalance: string = '';

  readonly productPresets: Array<{title: string; value: string}> = [
    { title: 'Select all', value: 'all' },
    { title: 'Unpublished', value: 'unpublished' },
    { title: 'Expired', value: 'expired' },
    { title: 'Deselect all', value: 'none' }
  ];

  readonly publishDuration: Array<{title: string; value: number}> = [
    { title: '1 day', value: 1 },
    { title: '2 days', value: 2 },
    { title: '4 days', value: 4 },
    { title: '1 week', value: 7 }
  ];

  readonly categories: Array<{title: string; value: string}> = [
    { title: 'Furniture', value: 'f' },
    { title: 'Yachts', value: 'y' },
    { title: 'Bots', value: 'b' },
    { title: 'Electronics', value: 'e' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
