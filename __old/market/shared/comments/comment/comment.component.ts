import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Log } from 'ng2-logger';
import { CommentService } from 'app/core/market/api/comment/comment.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { MarketNotificationService } from 'app/core/market/market-notification/market-notification.service';
import { SnackbarService } from 'app/core/core.module';
import { DateFormatter } from 'app/core/util/utils';

import * as _ from 'lodash';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  private log: any = Log.create('comment.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() comment: any;
  @Input() commentIndex: number;
  @Input() sellerAddress: string;
  @Input() targetComments: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();

  get hasUnreadComments(): boolean {
    if (this.targetComments) {
      return this.targetComments.indexOf(this.comment.hash) !== -1;
    }
  }

  /* tslint:disable:no-bitwise */
  get senderDetail(): string {
    if (this.comment && this.comment.sender) {
      let hash = 0;
      for (let i = 0; i < this.comment.sender.length; i++) {
        hash = this.comment.sender.charCodeAt(i) + ((hash << 5) - hash);
      }
      let colour = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }
      return colour;
    }
    return '';
  }
  /* tslint:enable:no-bitwise */

  constructor(
    private commentService: CommentService,
    private modals: ModalsHelperService,
    private snackbar: SnackbarService,
    private notification: MarketNotificationService
  ) {}

  postReply(reply: any) {
    this.modals.unlock({ timeout: 30 }, () => {
      this.commentService.post(1, '', this.comment.type, this.comment.target, reply.value, this.comment.hash)
        .pipe(take(1))
        .subscribe(
          () => {
            this.refresh.emit(true);
            reply.value = '';
            this.snackbar.open('Reply successfully posted');
          },
          (error) => {
            this.snackbar.open('Error posting question');
            this.log.error(error);
          }
        );
    });
  }

  getPostedAtDate(reply: any): string {
    if (reply.postedAt === Number.MAX_SAFE_INTEGER) {
      return new DateFormatter(new Date(reply.createdAt)).dateFormatter(false);
    } else {
      return new DateFormatter(new Date(reply.postedAt)).dateFormatter(false);
    }
  }

  isPosterSeller(sender: string): boolean {
    return sender === this.sellerAddress;
  }

  hasSellerResponded(): boolean {
    return !!_.find(this.comment.ChildComments, (reply) => reply.sender === this.sellerAddress);
  }

  clearUnreadNotifications() {
    if (this.hasUnreadComments) {
      this.notification.clearTargetUnread('LISTINGITEM_QUESTION_AND_ANSWERS', this.comment.target);
      this.refresh.emit(false);
    }
  }
}
