import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserMessage } from './user-message.model';

/*
  The point of this is to provide something similar to a message-bus of user important announcements.
  Its currently a hash (hacky) job, and needs some love and care to work as its expected.
  There's been no requirement for it as yet, which means there exists no implementation plan or idea of what to expect.
  So this is provided as a base from which to grow the requirements for its adoption and use.
*/
@Injectable()
export class UserMessageService {
  message: BehaviorSubject<UserMessage> = new BehaviorSubject<UserMessage>(null);

  constructor(
  ) {}

  addMessage(message: UserMessage) {
    this.message.next(message);
  }
}
