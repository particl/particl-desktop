import { Injectable } from '@angular/core';
import { timer, BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

export interface MessageQuote {
  author: string;
  text: string;
}

@Injectable()
export class MotdService {

  private readonly _messages: MessageQuote[] = [
    {
      text: 'Did you know that Particl Marketplace allows users to buy currencies, acting as a decentralized exchange? Particl continues Satoshi\'s work.',
      author: ''
    },
    {
      text: '“I started implementing a marketplace feature earlier that facilitates offering things for sale and taking orders (...). A bit like e-bay, but without auctions (...). Among other things, it would make it easy for anyone to offer currency exchange.”',
      author: 'Satoshi Nakamoto, Apr 14, 2009'
    },
    {
      text: 'Particl market provides added protection for buyers and sellers, making it a smarter, safer way to shop online. Particl continues Satoshi\'s work.',
      author: ''
    },
    {
      text: '“I was trying to implement an eBay style marketplace built in to the client(...).”',
      author: 'Satoshi Nakamoto, Mar 9, 2011'
    },
    {
      text: 'Did you know that Satoshi Nakomoto originally included a decentralised marketplace in the Bitcoin protocol. Particl continues his work.',
      author: '"#include "market.h" , Satoshi Nakamoto, 2009 Bitcoin source code, headers.h, line 69'
    },
    {
      text: '"// Add atoms to user reviews for coins created"',
      author: 'Satosh Nakamoto, Bitcoin source code 2009, main.cpp, Line 1226'
    }
  ];

  private readonly _messageIntervalSeconds: number = 120;
  private readonly _numGenerations: number = 1;
  private _currentMessage: BehaviorSubject<MessageQuote> = new BehaviorSubject({text: '', author: ''});

  constructor() {
    if (this._messages.length) {
      timer(0, this._messageIntervalSeconds * 1000).pipe(
        take(this._numGenerations),  // only switch this many times
        tap(() => {
          const idx = Math.floor(Math.random() * this._messages.length);
          let nextMsg = this._messages[idx];
          if (this._currentMessage.value.text === nextMsg.text) {
            nextMsg = this._messages[(idx + 1) % this._messages.length];
          }
          this._currentMessage.next(nextMsg);
        })
      ).subscribe();
    }
  }

  get motd(): Observable<MessageQuote> {
    return this._currentMessage.asObservable();
  }

}
