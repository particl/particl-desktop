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
    // @TODO: populate these with relevant quotations and optionally their authors (leave blank string for no author)
    // {text: '', author: ''},
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
