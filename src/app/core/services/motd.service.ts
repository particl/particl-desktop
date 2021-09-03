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
      text: 'Particl Marketplace provides added protection for buyers and sellers, making it a smarter, safer way to shop online. Particl continues Satoshi\'s work.',
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
    },
    {
      text: 'There’s only one basic principle of self-defense. You must apply the most effective weapon, as soon as possible, to the most vulnerable target.',
      author: 'Bruce Lee'
    },
    {
      text: 'The right of self-defense never ceases. It is among the most sacred, and alike necessary to nations and to individuals.',
      author: 'James Monroe'
    },
    {
      text: 'Arguing that you don\'t care about the right to privacy because you have nothing to hide is no different than saying you don\'t care about free speech because you have nothing to say.',
      author: 'Edward Snowden'
    },
    {
      text: 'They who can give up essential liberty to obtain a little temporary safety deserve neither liberty nor safety.',
      author: 'Benjamin Franklin'
    },
    {
      text: 'All human beings have three lives: public, private, and secret.',
      author: 'Gabriel García Márquez'
    },
    {
      text: 'In the truest sense, freedom cannot be bestowed; it must be achieved.',
      author: 'Franklin D. Roosevelt'
    },
    {
      text: 'We must be free not because we claim freedom, but because we practice it.',
      author: 'William Faulkner'
    },
    {
      text: 'For to be free is not merely to cast off one’s chains, but to live in a way that respects and enhances the freedom of others',
      author: 'Nelson Mandela'
    },
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
