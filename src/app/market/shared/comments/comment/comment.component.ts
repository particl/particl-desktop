import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Log } from 'ng2-logger';
import { CommentService } from 'app/core/market/api/comment/comment.service';
import { ModalsHelperService } from 'app/modals/modals.module';
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
  @Output() replied: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private commentService: CommentService,
    private modals: ModalsHelperService,
    private snackbar: SnackbarService
  ) {}

  postReply(reply: any) {
    this.modals.unlock({ timeout: 30 }, () => {
      this.commentService.post(1, '', this.comment.type, this.comment.target, reply.value, this.comment.hash)
        .pipe(take(1))
        .subscribe(
          () => {
            this.replied.emit();
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
    if (reply.postedAt === Number.MAX_SAFE_INTEGER){
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
}
