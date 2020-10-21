import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bot-detail-modal',
  templateUrl: './bot-detail-modal.component.html',
  styleUrls: ['./bot-detail-modal.component.scss']
})
export class BotDetailModalComponent implements OnInit {

  public bot: any = {
    image: './assets/images/placeholder_3-4.jpg',
    title: 'Layout Testing Bot',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur ratione in numquam, aliquam iusto asperiores nisi modi dolores facilis sint, illum hic mollitia dolorum.',
    status: 'inactive', // all lowercase
    enabled: false,
    type: 'Exchange',
    homepage: 'https://particl-community.com/exchange-bot',
    address: 'paqiHKdyc2rAak1tp3Z8EeeFNH154XrTC6',
    author: {
      name: 'BotCreator the Great',
      email: 'botcreator@particl-community.com',
      chat: 'Riot: botcreator@matrix.org'
    }
  };

  constructor() { }

  ngOnInit() {
  }

}
