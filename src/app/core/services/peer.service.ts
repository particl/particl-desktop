import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { RpcService } from './rpc.service';
import { AppData } from '../store/app.actions';
import { PeerModel } from '../store/app.models';


@Injectable({
  providedIn: 'root'
})
export class PeerService implements OnDestroy {

  private log: any = Log.create('peer.service id:' + Math.floor((Math.random() * 1000) + 1));
  private started: boolean = false;
  private POLLING_INTERVAL: number = 10000;
  private timeout: any = null;

  private highestBlockHeightNetwork: number = -1;

  constructor(
    private _rpc: RpcService,
    private _store: Store
  ) { }


  ngOnDestroy() {
    this.started = false;
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
  }


  get networkBlockHeight() {
    return this.highestBlockHeightNetwork;
  }


  start() {
    this.log.d('poll() called to start polling for data');
    if (this.started) {
      this.log.d('already polling... ignoring the additional request');
      return;
    }
    this.started = true;
    this.poll();
  }


  private poll() {
    this.log.d('performing peer poll request');

    this._rpc.call('', 'getpeerinfo').subscribe(
      (peerinfo: Array<PeerModel>) => {
        this.processNewPeers(peerinfo);
      },
      error => this.log.er(`poll() fetch error'd -> ${error}`),
      () => {
        console.log('@@@ hit complete state');
        if (this.started) {
          this.timeout = setTimeout(this.poll.bind(this), this.POLLING_INTERVAL);
        }
      }
    );
  }


  private processNewPeers(peerList: Array<PeerModel>): void {
    console.log('@@@@@@@@ GOT NEW PEERS: ', peerList);
    this._store.dispatch(new AppData.GotPeers(peerList));
    let highestBlockHeightNetwork = -1;

    peerList.forEach(peer => {
      const networkHeightByPeer = peer.currentheight;

      if (highestBlockHeightNetwork < networkHeightByPeer || highestBlockHeightNetwork === -1) {
        highestBlockHeightNetwork = networkHeightByPeer;
      }
    });

    this.highestBlockHeightNetwork = highestBlockHeightNetwork;
  }
}
