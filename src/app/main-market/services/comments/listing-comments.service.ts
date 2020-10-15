import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngxs/store';


import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { ListingComment } from './comments.models';
import { COMMENT_TYPES, RespCommentListItem, RespCommentPost } from '../../shared/market.models';
import { getValueOrDefault, isBasicObjectType } from '../../shared/utils';


@Injectable()
export class ListingCommentsService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  fetchListingComments(marketAddress: string, listingHash: string, parentCommentHash?: string): Observable<ListingComment[]> {
    const params = ['search', 0, 1000000, 'DESC', 'created_at', COMMENT_TYPES.LISTINGITEM_QUESTION_AND_ANSWERS, marketAddress, listingHash];
    if (parentCommentHash) {
      params.push(parentCommentHash);
    }
    return this._rpc.call('comment', params).pipe(
      map((resp: RespCommentListItem[]) => {
        const commentsList: ListingComment[] = [];
        if (Array.isArray(resp)) {
          resp.forEach(item => {
            const comment = this.buildListingComment(item);
            if (comment.hash.length > 0) {
              commentsList.push(comment);
            }
          });
        }
        return commentsList;
      })
    );
  }


  postListingComment(
    comment: string, identityId: number, marketAddress: string, listingHash: string, parentCommentHash?: string
  ): Observable<boolean> {
    const params = ['post', identityId, COMMENT_TYPES.LISTINGITEM_QUESTION_AND_ANSWERS, marketAddress, listingHash];
    if (parentCommentHash) {
      params.push(parentCommentHash);
    }
    return this._rpc.call('comment', params).pipe(
      map((resp: RespCommentPost) => {
        return isBasicObjectType(resp) && (resp.result === 'Sent.');
      })
    );
  }


  private buildListingComment(src: RespCommentListItem): ListingComment {
    const newItem: ListingComment = {
      hash: '',
      parentHash: null,
      childCount: 0,
      created: 0,
      sender: '',
      commentText: ''
    };

    if (!isBasicObjectType(src)) {
      return newItem;
    }

    newItem.hash = getValueOrDefault(src.hash, 'string', newItem.hash);
    if ((+src.parentCommentId > 0) && isBasicObjectType(src.ParentComment)) {
      newItem.parentHash = getValueOrDefault(src.ParentComment.hash, 'string', '');
    }

    newItem.childCount = Array.isArray(src.ChildComments) ? src.ChildComments.length : newItem.childCount;
    newItem.created = +src.postedAt > 0 ? +src.postedAt : newItem.created;
    newItem.sender = getValueOrDefault(src.sender, 'string', newItem.sender);
    newItem.commentText = getValueOrDefault(src.message, 'string', newItem.commentText);

    return newItem;
  }
}
