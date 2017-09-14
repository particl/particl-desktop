import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs'; // use this for testing atm

import { RPCService } from './rpc.service';

@Injectable()
export class PeerService {
  // TODO: Peer interface
  private _peerList: Observable<Array<Object>>;
  private _observerPeerList: Observer<Array<Object>>;

  private _highestBlockHeightInternal: Observable<number>;
  private _observerHighestBlockHeightInternal: Observer<number>;

  private _highestBlockHeightNetwork: Observable<number>;
  private _observerHighestBlockHeightNetwork: Observer<number>;
  private subs: Subscription;

  constructor(private _rpc: RPCService) {

    this._peerList = Observable.create(
      observer => this._observerPeerList = observer
    ).publishReplay(1).refCount();
    this._peerList.subscribe().unsubscribe();

    // setup observable for internal block height
    this._highestBlockHeightInternal = this._rpc.state.observe('blocks');

    // setup observable for network block height
    this._highestBlockHeightNetwork = Observable.create(
      observer => {
        this._observerHighestBlockHeightNetwork = observer
      }
    ).publishReplay(1).refCount();

    this._highestBlockHeightNetwork.subscribe().unsubscribe();

    // Subscribe to connections state
    this._rpc.state.observe('connections')
      .subscribe(_ => this._rpc.call('getpeerinfo')
        .subscribe((peerinfo: Array<Object>) => {
          this.setPeerList(peerinfo);
        }));
  }

  private setPeerList(peerList: Array<Object>) {

    // hook network block height changes
    this._observerHighestBlockHeightNetwork.next(this.calculateBlockCountNetwork(peerList));

    this._observerPeerList.next(peerList);
  }

  private calculateBlockCountNetwork(peerList: Array<Object>): number {
    let highestBlockHeightNetwork = -1;

    peerList.forEach(peer => {
      const networkHeightByPeer= (<any>peer).currentheight;

      if (highestBlockHeightNetwork < networkHeightByPeer || highestBlockHeightNetwork === -1) {
        highestBlockHeightNetwork = networkHeightByPeer;
      }
    });

    return highestBlockHeightNetwork;
  }

  getBlockCount(): Observable<number> {
    return this._highestBlockHeightInternal;
  }

  getBlockCountNetwork(): Observable<number> {
    return this._highestBlockHeightNetwork;
  }

  getPeerList(): Observable<Array<Object>> {
    return this._peerList;
  }

}
