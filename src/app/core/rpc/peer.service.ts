import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs'; // use this for testing atm

import { RPCService } from './rpc.service';

@Injectable()
export class PeerService {
  private _peerList: Observable<Array<Object>>;
  private _observerPeerList: Observer<Array<Object>>;

  private _highestBlockHeightInternal: Observable<number>;
  private _observerHighestBlockHeightInternal: Observer<number>;

  private _highestBlockHeightNetwork: Observable<number>;
  private _observerHighestBlockHeightNetwork: Observer<number>;

  constructor(public rpc: RPCService) {

    this.rpc.register(this, 'getpeerinfo', null, this.setPeerList, 'block');
    this.rpc.register(this, 'getblockcount', null, this.setBlockCount, 'block');

    this._peerList = Observable.create(observer => this._observerPeerList = observer).publishReplay(1).refCount();
    this._peerList.subscribe().unsubscribe();

    // setup observable for internal block height
    this._highestBlockHeightInternal = Observable.create(
      observer => this._observerHighestBlockHeightInternal = observer
    ).publishReplay(1).refCount();

    this._highestBlockHeightInternal.subscribe().unsubscribe();

    // setup observable for network block height
    this._highestBlockHeightNetwork = Observable.create(
      observer => this._observerHighestBlockHeightNetwork = observer
    ).publishReplay(1).refCount();

    this._highestBlockHeightNetwork.subscribe().unsubscribe();

  }

  private setPeerList(JSON: Array<Object>) {
    this._observerPeerList.next(JSON);

    // hook network block height changes
    this._observerHighestBlockHeightNetwork.next(this.setBlockCountNetwork(JSON));
  }

  private setBlockCount(height: number) {
    this._observerHighestBlockHeightInternal.next(height);
  }

  private setBlockCountNetwork(peerList: Array<Object>): number {
    let highestBlockHeightNetwork: number = -1;

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
