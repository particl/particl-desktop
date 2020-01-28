import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { auditTime, concatMap } from 'rxjs/operators';

import { RpcGetPeerInfo } from './block-sync.models';
import { Observable } from 'rxjs';
import { RpcGetStakingInfo } from 'app/main-wallet/active-wallet/overview/widgets/staking-info-widget/staking-info-widget.models';


@Injectable()
export class BlockSyncService implements OnDestroy {
  private log: any = Log.create('block-sync.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  ngOnDestroy() {
    this.log.d('service destroyed');
  }


  fetchPeerInfo(): Observable<RpcGetPeerInfo[]> {
    return this._rpc.call('getpeerinfo');
  }


  // fetchPeerData() {
  //   this.fetchPeerInfo().pipe(
  //     auditTime(5000),
  //     concatMap((peerinfo: RpcGetPeerInfo[]) => {
  //       console.log('@@@@ GOT PEER INFO!!!: ', peerinfo);

  //       const highestBlock = this.calculateBlockCountNetwork(peerinfo);
  //     })
  //   )
  // }


  calculateBlockCountNetwork(peerList: RpcGetPeerInfo[]): number {
    let highestBlock = -1;

    peerList.forEach(peer => {
      const peerBlockHeight = peer.currentheight;

      if (peerBlockHeight > highestBlock) {
        highestBlock = peerBlockHeight;
      }
    });

    return highestBlock;
  }
}
