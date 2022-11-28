import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import { FormControl } from '@angular/forms';
import { Observable, Subject, throwError, of, merge, iif, defer } from 'rxjs';
import { tap, takeUntil, filter, switchMap, catchError, concatMap, mapTo, finalize } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ListingCommentsService } from '../../services/comments/listing-comments.service';
import { getValueOrDefault } from '../utils';
import { ListingItemComment } from '../../services/comments/comments.models';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';


enum TextContent {
  LABEL_SECTION_HEADER = 'Item Reviews',
  LOADING_ERROR = 'Error occurred while loading comments',
  COMMENT_POST_ERROR = 'Error while creating your comment!',
  COMMENT_UPDATE_ERROR = 'Review created, but failed to update the display correctly',
  COMMENT_LENGTH_ERROR = 'Review exceeds maximum length allowed'
}



@Component({
  selector: 'market-listing-comments',
  templateUrl: './listingitem-comments.component.html',
  styleUrls: ['./listingitem-comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingItemCommentsComponent implements OnInit, OnDestroy {

  @Input() sectionHeaderLabel: string = TextContent.LABEL_SECTION_HEADER;
  @Input() marketReceiveAddress: string = '';
  @Input() listingHash: string = '';
  @Input() listingSellerAddress: string = '';

  treeControl: NestedTreeControl<ListingItemComment> = new NestedTreeControl<ListingItemComment>(node => node.children);
  dataSource: MatTreeNestedDataSource<ListingItemComment> = new MatTreeNestedDataSource<ListingItemComment>();

  isLoadingComments: boolean = true;
  isBusy: boolean = true;
  hasNewCommentsPending: boolean = false;
  hasMoreComments: boolean = false;

  readonly MAX_COMMENT_LENGTH: number = 4000;


  private destroy$: Subject<void> = new Subject();
  private readonly PAGE_COUNT: number;
  private pageChangeControl: FormControl = new FormControl(0);


  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _commentService: ListingCommentsService,
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService
  ) {
    this.dataSource.data = [];
    this.PAGE_COUNT = this._store.selectSnapshot(MarketState.settings).defaultListingCommentPageCount;
  }


  ngOnInit() {
    if (
      !((getValueOrDefault(this.listingHash, 'string', '').length > 0) &&
        (getValueOrDefault(this.marketReceiveAddress, 'string', '').length > 0))
    ) {
      this.isLoadingComments = false;
      this.isBusy = true;
      return;
    }


    const pageChanger$ = this.pageChangeControl.valueChanges.pipe(
      filter(value => +value >= 0),
      tap(() => {
        this.isLoadingComments = true;
        this.isBusy = true;
        this._cdr.detectChanges();
      }),
      switchMap((pageNum) => this.loadComments(pageNum).pipe(
        tap((comments) => {
          const allComments  = this.dataSource.data;
          allComments.push(...comments);
          this.dataSource.data = allComments;
          this.isLoadingComments = false;
          this.isBusy = false;
        }),
        catchError((err) => {
          this._snackbar.open(TextContent.LOADING_ERROR, 'warn');
          return of([] as ListingItemComment[]);
        }),
        tap(() => {
          this.isLoadingComments = false;
          this.isBusy = false;
          this._cdr.detectChanges();
        })
      )),
      takeUntil(this.destroy$)
    );

    const newCommentListener$ = this._commentService.getCommentSocketistener(this.listingHash).pipe(
      tap(() => {
        if (!this.hasNewCommentsPending) {
          this.hasNewCommentsPending = true;
          this._cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    );

    merge(
      pageChanger$,
      newCommentListener$,
    ).subscribe();

    this.resetCommentList();

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  isParent = (_: number, node: ListingItemComment) => !(+node.parentCommentId > 0) || (!!node.children && (node.children.length > 0));


  addComment(element: any, parentHash?: string): void {

    // NB! works with the native DOM element here, so beware!!!

    let commentText = '';

    try {
      if (element && (typeof element.value === 'string')) {
        const text = element.value;
        commentText = text.trim();
      }
    } catch (e) {
      // nothing really to do here
    }

    if (this.isBusy || !commentText) {
      return;
    }

    if (commentText.length > this.MAX_COMMENT_LENGTH) {
      this._snackbar.open(TextContent.COMMENT_LENGTH_ERROR, 'warn');
      return;
    }

    this.isBusy = true;
    this._unlocker.unlock({timeout: 10}).pipe(
      finalize(() => this.isBusy = false),
      concatMap((isUnlocked) => iif(
        () => isUnlocked,

        defer(() => this._commentService.addListingComment(
          commentText, this.marketReceiveAddress, this.listingHash, !!parentHash ? parentHash : null
          ).pipe(
          tap((newComment) => {
            if (newComment === null) {
              throwError('FETCH ERROR');
              return;
            }
          })
        ))
      ))
    ).subscribe(
      (newComment) => {
        newComment.isSeller = newComment.sender.addressFull === this.listingSellerAddress;

        if (parentHash) {
          const existingComments = this.dataSource.data;
          const foundParentIdx = existingComments.findIndex(c => c.commentHash === parentHash);

          if ((foundParentIdx > -1) && existingComments[foundParentIdx].commentHash === parentHash) {
            const updatedComment = JSON.parse(JSON.stringify(existingComments[foundParentIdx]));
            /**
             * parentCommentId is simply used to determine whether a comment is a reply or not. Since this comment was a reply
             *  to another thread, determine the correct parent comment id, or if this was the first reply, use any non-zero value to
             *  ensure this reply is correctly identified as such. Probably better to use a boolean in this case... future someone's issue.
             * (note: parent comment hash could have been used but numerical id is shorter and quicker to compare)
             * */
            newComment.parentCommentId = updatedComment.children.length > 0 ? updatedComment.children[0].parentCommentId : 1;
            updatedComment.children.push(newComment);
            // Splice and insert clone. Forces an update in the display (updating the children array value doesn't update the object's hash)
            existingComments.splice(foundParentIdx, 1, updatedComment);
            this.dataSource.data = existingComments;
          }
        } else {
          this.dataSource.data = [newComment, ...this.dataSource.data];
        }

        element.value = '';
        this._cdr.detectChanges();
      },
      (err) => this._snackbar.open(
        (typeof err === 'string') && (err === 'FETCH ERROR') ? TextContent.COMMENT_UPDATE_ERROR : TextContent.COMMENT_POST_ERROR,
        'warn')
    );
  }


  refreshCommentList(): void {
    if (this.isBusy) {
      return;
    }
    this.resetCommentList();
  }


  loadMoreComments(): void {
    if (this.isBusy || !this.hasMoreComments) {
      return;
    }
    this.pageChangeControl.setValue(Math.floor(this.dataSource.data.length / this.PAGE_COUNT));
  }


  private loadComments(currentPageNum: number): Observable<ListingItemComment[]> {
    return this._commentService.fetchListingComments(
      currentPageNum, this.PAGE_COUNT, this.marketReceiveAddress, this.listingHash, this.listingSellerAddress || ''
    ).pipe(
      concatMap((commentsList) => iif(
        // check if there are more items to load, then regardless, return the fetched comment list
        () => commentsList.length === this.PAGE_COUNT,

        defer(() => {
          return this._commentService.fetchListingComments(
            ((currentPageNum + 1) * this.PAGE_COUNT), 1, this.marketReceiveAddress, this.listingHash, this.listingSellerAddress || ''
          ).pipe(
            catchError(() => of(null)),
            tap((extraList => {
              this.hasMoreComments = Array.isArray(extraList) && (extraList.length > 0);
            })),
            mapTo(commentsList)
          );
        }),
        defer(() => {
          this.hasMoreComments = false;
          return of(commentsList);
        })
      ))
    );
  }


  private resetCommentList(): void {
    this.hasNewCommentsPending = false;
    this.dataSource.data = [];
    this.pageChangeControl.setValue(0);
  }

}
