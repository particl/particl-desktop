import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs'; // use this for testing atm

import { RPCService } from './rpc.service';
import { StateService } from '../state/state.service';

@Injectable()
export class PeerService {
  private _peerList: Observable<Array<Object>>;
  private _observerPeerList: Observer<Array<Object>>;

  private _highestBlockHeightInternal: Observable<number>;
  private _observerHighestBlockHeightInternal: Observer<number>;

  private _highestBlockHeightNetwork: Observable<number>;
  private _observerHighestBlockHeightNetwork: Observer<number>;
  private subs: Subscription;

  constructor(
    public rpc: RPCService,
    state: StateService) {

    this.rpc.registerStateCall('getpeerinfo');

    this._peerList = Observable.create(
      observer => this._observerPeerList = observer
    ).publishReplay(1).refCount();
    this._peerList.subscribe().unsubscribe();

    // setup observable for internal block height
    this._highestBlockHeightInternal = Observable.create(
      observer => this._observerHighestBlockHeightInternal = observer
    ).publishReplay(1).refCount();

    this._highestBlockHeightInternal.subscribe().unsubscribe();

    // setup observable for network block height
    this._highestBlockHeightNetwork = Observable.create(
      observer => {
        this._observerHighestBlockHeightNetwork = observer
      }
    ).publishReplay(1).refCount();

    this._highestBlockHeightNetwork.subscribe().unsubscribe();

    // subscribe to chain state
    this.rpc.state.observe('getpeerinfo')
      .subscribe(peerinfo => {
        this._observerPeerList.next(peerinfo);
        this.setPeerList(peerinfo);
      });

    this.rpc.state.observe('blocks')
      .subscribe(blocks => this._observerHighestBlockHeightInternal.next(blocks));

  }

  private setPeerList(peerList: Array<Object>) {

    // hook network block height changes
    this._observerHighestBlockHeightNetwork.next(this.calculateBlockCountNetwork(peerList));

    this._observerPeerList.next(peerList);
  }

  private calculateBlockCountNetwork(peerList: Array<Object>): number {
    let highestBlockHeightNetwork = -1;

    for (const peer in peerList) {
      if (true) { // lint issue
        const networkHeightByPeer: number = +peerList[peer]['currentheight'];

        if (highestBlockHeightNetwork < networkHeightByPeer || highestBlockHeightNetwork === -1) {
          highestBlockHeightNetwork = networkHeightByPeer;
        }
      }
    }

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
