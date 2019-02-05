import { Component, OnInit } from '@angular/core';

import { UserMessageService } from 'app/core/market/user-messages/user-message.service';
import { UserMessage, UserMessageType } from 'app/core/market/user-messages/user-message.model';

@Component({
  selector: 'app-announcement-notification',
  templateUrl: './announcement-notification.component.html',
  styleUrls: ['./announcement-notification.component.scss']
})
export class AnnouncementNotificationComponent implements OnInit {
  message: UserMessage | null;
  UserMessageType: typeof UserMessageType = UserMessageType;
  constructor(
    private messagesService: UserMessageService
  ) { }

  ngOnInit() {
    this.messagesService.message.subscribe((message) => {
      this.message = message;
    });
  }

}
