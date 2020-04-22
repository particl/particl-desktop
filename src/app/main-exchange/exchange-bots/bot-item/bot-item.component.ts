import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bot-item',
  templateUrl: './bot-item.component.html',
  styleUrls: ['./bot-item.component.scss']
})
export class BotItemComponent implements OnInit {

  /* test only >>> */

  public bot: any = {
    name: 'SimpleSwap Exchange Bot',
    image: './assets/images/placeholder_4-3.jpg',
    enabled: true,
    description: 'Exchanges BTC for PART',
    address: 'PYMCPz3Qw3gdf4EpBvBW9PFQCoKTZ98a1H',
    supported_coins: [ // this is a new one, will be needed for filtering
      'btc',
      'dai',
      'part'
    ],
    author: {
      name: 'Robert Edwards',
      email: 'rob@particl.io',
      chat_ids: [
        {
          id: '@spazzymoto',
          type: 'Riot'
        },
        {
          id: '@spazzy',
          type: 'Telegram'
        }
      ]
    }
  }

  /* << test only */

  constructor() { }

  ngOnInit() {
  }

}
