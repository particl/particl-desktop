import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bot-management',
  templateUrl: './bot-management.component.html',
  styleUrls: ['./bot-management.component.scss']
})
export class BotManagementComponent implements OnInit {

  isLoadingBig: boolean = false;

  filters: any = {
    search:   ''
  };

  supported_types: Array<any> = [
    { title: 'Exchange',   value: 'exchange', },
    { title: 'Chat',       value: 'chat', },
    { title: 'Gambling',   value: 'gambling', },
    { title: 'Prediction', value: 'prediction', }
  ];

  bots_status: Array<any> = [
    { title: 'All statuses', amount: '4', value: 'all', },
    { title: 'Active',       amount: '3', value: 'active', },
    { title: 'Inactive',     amount: '1', value: 'inactive', }
  ];

  public bots: any = [
    {
      id: '1',
      image: './assets/images/placeholder_3-4.jpg',
      title: 'Layout Testing Bot',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: true
    },
    {
      id: '2',
      image: './assets/images/placeholder_4-3.jpg',
      title: 'Another Testing Bot and second line stuff',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: false
    },
    {
      id: '3',
      image: './assets/images/placeholder_3-4.jpg',
      title: 'SimpleSwap Exchange bot',
      summary: 'Hey, need some $PART, yo?',
      active: false
    },
    {
      id: '4',
      image: './assets/images/placeholder_3-4.jpg',
      title: 'Another Testing Bot',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: true
    },
    {
      id: '1',
      image: './assets/images/placeholder_4-3.jpg',
      title: 'Layout Testing Bot',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: true
    },
    {
      id: '2',
      image: './assets/images/placeholder_1-1.jpg',
      title: 'Another Testing Bot',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: true
    },
    {
      id: '3',
      image: './assets/images/placeholder_3-4.jpg',
      title: 'SimpleSwap Exchange bot',
      summary: 'Hey, need some $PART, yo?',
      active: false
    },
    {
      id: '4',
      image: './assets/images/placeholder_3-4.jpg',
      title: 'Another Testing Bot',
      summary: 'Placeholder bot for testing the new Bot Management page',
      active: false
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
