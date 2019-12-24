import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';
import { CommentService } from 'app/core/market/api/comment/comment.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { MarketNotificationService } from 'app/core/market/market-notification/market-notification.service';
import { SnackbarService } from 'app/core/core.module';
import { Subscription, Subject } from 'rxjs';

import * as _ from 'lodash';
import { take, delay } from 'rxjs/operators';
import { environment } from 'environments/environment';

interface IPage {
  pageNumber: number,
  pageSubscription: Subscription;
  comments: Array<any>;
}

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnDestroy, OnInit {

  private log: any = Log.create('comments.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() type: string;
  @Input() target: string;
  @Input() sellerAddress: string;

  public commentCount: any;

  public refresh: Subject<any> = new Subject<any>();

  private commentCount$: Subscription;
  private comment$: Subscription;

  public isLoading: boolean = true;
  public pages: Array<IPage> = [];
  public pagination: any = {
    maxPerPage: 10,
    infinityScrollSelector: '.mat-dialog-content'
  };

  private targetComments: any[];

  constructor(
    private commentService: CommentService,
    private modals: ModalsHelperService,
    private snackbar: SnackbarService,
    private notification: MarketNotificationService
  ) {}

  ngOnInit() {
    if (!environment.isTesting) {
      this.commentCount$ = this.commentService.watchCommentCount(this.type, this.target, '', this.refresh)
        .subscribe((count) => {
          this.commentCount = count;
        });
      this.loadPage(0);
      this.comment$ = this.notification.onEvent('NEW_COMMENT').pipe(delay(500))
      .subscribe((comment) => {
        if (comment.type === this.type && comment.target === this.target) {
          this.doRefresh(true);
        }
      });
      this.targetComments = this.notification.getTargetUnread('LISTINGITEM_QUESTION_AND_ANSWERS', this.target);
    }
  }

  ngOnDestroy() {
    if (this.commentCount$) {
      this.commentCount$.unsubscribe();
    }

    if (this.comment$) {
      this.comment$.unsubscribe();
    }

    for (const page of this.pages) {
      if (page.pageSubscription) {
        page.pageSubscription.unsubscribe();
      }
    }

    this.refresh.complete();
  }

  public doRefresh(refreshComments: boolean) {
    this.targetComments = this.notification.getTargetUnread('LISTINGITEM_QUESTION_AND_ANSWERS', this.target);
    if (refreshComments) {
      this.refresh.next();
    }
  }

  postQuestion(question: any) {
    this.modals.unlock({ timeout: 30 }, () => {
      this.commentService.post(1, '', 'LISTINGITEM_QUESTION_AND_ANSWERS', this.target, question.value)
        .pipe(take(1))
        .subscribe(
          (comment) => {
            this.refresh.next();
            question.value = '';
            this.snackbar.open('Question successfully posted');
          },
          (error) => {
            this.snackbar.open('Error posting question, ' + error);
            this.log.error(error);
          }
        );
    });
  }

  loadPage(pageNumber: number) {
    const commentPage$ = this.commentService.watch(pageNumber, this.pagination.maxPerPage, this.type, this.target, '', this.refresh)
      .subscribe((comments: Array<any>) => {
        this.isLoading = false;

        const existingPage = _.find(this.pages, (page) => page.pageNumber === pageNumber);

        if (existingPage) {
          existingPage.comments = comments;
        } else {
          if (comments.length > 0 || pageNumber === 0) {

            const page = {
              pageNumber: pageNumber,
              pageSubscription: commentPage$,
              comments: comments
            };

            this.pages.push(page);
          } else {
            commentPage$.unsubscribe();
          }
        }
      });
  }

  loadNextPage() {
    let nextPage = this.getLastPageCurrentlyLoaded();
    nextPage++;
    this.loadPage(nextPage);
  }

  // Returns the pageNumber of the last page that is currently visible
  getLastPageCurrentlyLoaded() {
    return this.pages.length > 0 && this.pages[this.pages.length - 1].pageNumber;
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

}
