import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { MarketSocketService } from '../market-rpc/market-socket.service';
import { ListingItemComment } from './comments.models';
import { COMMENT_TYPES, RespCommentListItem, RespCommentPost } from '../../shared/market.models';
import { getValueOrDefault, isBasicObjectType } from '../../shared/utils';
import { SocketMessages_v03 } from 'app/main-market/shared/market-socket.models';


@Injectable()
export class ListingCommentsService {


  private readonly SENDER_SHORT_ADDRESS_LENGTH: number = 6;

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _socket: MarketSocketService
  ) {}


  fetchListingComments(
    pageNum: number, pageCount: number, marketAddress: string, listingHash: string, sellerAddress: string, parentCommentHash?: string
  ): Observable<ListingItemComment[]> {
    const params = [
      'search',
      pageNum,
      pageCount,
      'DESC',
      'created_at',
      COMMENT_TYPES.LISTINGITEM_QUESTION_AND_ANSWERS,
      marketAddress,
      listingHash
    ];

    if (parentCommentHash) {
      params.push(parentCommentHash);
    }

    return this._rpc.call('comment', params).pipe(
      map((resp: RespCommentListItem[]) => {
        const commentsList: ListingItemComment[] = [];

        if (Array.isArray(resp)) {

          const identityAddress = this._store.selectSnapshot(MarketState.currentIdentity).address;

          resp.forEach(item => {
            const comment = this.buildListingComment(item, identityAddress, sellerAddress);
            if (comment.commentHash.length > 0) {
              commentsList.push(comment);
            }
          });
        }
        return commentsList;
      })
    );
  }


  getCommentSocketistener(listingHash?: string): Observable<SocketMessages_v03.CommentAdded> {
    return this._socket.getSocketMessageListener('MPA_COMMENT_ADD').pipe(
      filter((msg) => isBasicObjectType(msg) &&
                      (msg.commentType === 'LISTINGITEM_QUESTION_AND_ANSWERS') &&
                      (!!listingHash ? msg.target === listingHash : true))
    );
  }


  addListingComment(
    comment: string, marketAddress: string, listingHash: string, parentCommentHash?: string
  ): Observable<ListingItemComment | null> {

    const identity = this._store.selectSnapshot(MarketState.currentIdentity);
    const params = ['post', identity.id, COMMENT_TYPES.LISTINGITEM_QUESTION_AND_ANSWERS, marketAddress, listingHash, comment];

    if (parentCommentHash) {
      params.push(parentCommentHash);
    }

    return this._rpc.call('comment', params).pipe(
      map((resp: RespCommentPost) => {
        return isBasicObjectType(resp) && (resp.result === 'Sent.');
      }),
      map((isSuccess) => {
        if (!isSuccess) {
          return null;
        }

        // create basic comment item... for now missing some details, but that the caller can fill in if necessary.
        const newComment: ListingItemComment = this.getDefaultListingCommentItem();
        newComment.marketAddress = marketAddress;
        newComment.created = Date.now();
        newComment.sender.addressFull = identity.address;
        newComment.sender.addressShort = newComment.sender.addressFull.slice(0, this.SENDER_SHORT_ADDRESS_LENGTH);
        newComment.isMine = true;
        newComment.commentText = comment;

        return newComment;
      })
    );
  }


  private buildListingComment(src: RespCommentListItem, ownAddress: string, sellerAddress: string): ListingItemComment {
    const newItem: ListingItemComment = this.getDefaultListingCommentItem();

    if (!isBasicObjectType(src)) {
      return newItem;
    }

    newItem.commentHash = getValueOrDefault(src.hash, 'string', newItem.commentHash);
    newItem.listingHash = getValueOrDefault(src.target, 'string', newItem.listingHash);
    newItem.marketAddress = getValueOrDefault(src.receiver, 'string', newItem.marketAddress);
    newItem.created = getValueOrDefault(src.createdAt, 'number', newItem.created);

    newItem.sender.addressFull = getValueOrDefault(src.sender, 'string', newItem.sender.addressFull);
    newItem.sender.addressShort = newItem.sender.addressFull.slice(0, this.SENDER_SHORT_ADDRESS_LENGTH);

    newItem.isMine = newItem.sender.addressFull === ownAddress;
    newItem.isSeller = newItem.sender.addressFull === sellerAddress;

    newItem.commentText = getValueOrDefault(src.message, 'string', newItem.commentText);

    newItem.parentCommentId = getValueOrDefault(src.parentCommentId, 'number', newItem.parentCommentId) > 0 ?
      src.parentCommentId : newItem.parentCommentId;

    if (Array.isArray(src.ChildComments) && (src.ChildComments.length > 0)) {
      src.ChildComments.forEach(childComment => {
        const newChild = this.buildListingComment(childComment, ownAddress, sellerAddress);
        if (newChild.commentHash.length > 0) {
          newItem.children.push(newChild);
        }
      });

      newItem.children.sort((a, b) => a.created - b.created);
    }

    return newItem;
  }


  private getDefaultListingCommentItem(): ListingItemComment {
    return {
      commentHash: '',
      listingHash: '',
      marketAddress: '',
      created: 0,
      sender: {
        addressFull: '',
        addressShort: ''
      },
      isMine: false,
      isSeller: false,
      commentText: '',
      parentCommentId: 0,
      children: []
    };
  }
}
