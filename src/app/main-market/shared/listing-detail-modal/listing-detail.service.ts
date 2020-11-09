import { Injectable } from '@angular/core';
import { Observable, of, iif } from 'rxjs';
import { map, mapTo, catchError, filter, concatMap, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketUserActions } from '../../store/market.actions';

import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../../services/market-rpc/market-socket.service';

import { isBasicObjectType } from '../utils';
import { RespListingItem, RespCartItemAdd, RespItemFlag, RespVoteGet, RespVotePost } from '../market.models';
import { SocketMessages_v03 } from '../market-socket.models';


@Injectable()
export class ListingDetailService {

  constructor(
    private _rpc: MarketRpcService,
    private _socket: MarketSocketService,
    private _store: Store
  ) {}


  getListenerFlaggedItem(itemHash: string): Observable<SocketMessages_v03.ProposalAdded> {
    return this._socket.getSocketMessageListener('MPA_PROPOSAL_ADD').pipe(
      filter((msg) => msg && (msg.category === 'ITEM_VOTE') && (msg.target === itemHash))
    );
  }


  fetchVotingAction(marketId: number, proposalHash: string): Observable<RespVoteGet> {
    return this._rpc.call('vote', ['get', marketId, proposalHash]);
  }


  addFavourite(listingId: number): Observable<number | null> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('favorite', ['add', profileId, listingId]).pipe(
      map(item => item.id),
      catchError(() => of(null)),
    );
  }


  removeFavourite(favouriteId: number): Observable<boolean> {
    return this._rpc.call('favorite', ['remove', favouriteId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  reportItem(listingId: number): Observable<string> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('item', ['flag', listingId, identityId]).pipe(
      map((resp: RespItemFlag) => {
        return resp && resp.result && String(resp.result).toLowerCase() === 'sent.';
      }),

      concatMap((success) => iif(
        () => success,
        this._rpc.call('item', ['get', listingId, false]).pipe(
          map((detail: RespListingItem) => {
            if (
              isBasicObjectType(detail.FlaggedItem) &&
              isBasicObjectType(detail.FlaggedItem.Proposal) &&
              (typeof detail.FlaggedItem.Proposal.hash === 'string')
            ) {

              return detail.FlaggedItem.Proposal.hash;
            }

            return '';
          })
        )
      ))
    );
  }


  voteOnItemProposal(marketId: number, proposalHash: string, optionId: number): Observable<boolean> {
    return this._rpc.call('vote', ['post', marketId, proposalHash, optionId]).pipe(
      map((resp: RespVotePost) => {
        return resp && resp.result && String(resp.result).toLowerCase() === 'sent.';
      })
    );
  }


  addItemToCart(listingId: number, cartId: number): Observable<RespCartItemAdd> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('cartitem', ['add', cartId, listingId]).pipe(
      tap(() => this._store.dispatch(new MarketUserActions.CartItemAdded(identityId, cartId)))
    );
  }

}
