import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { retryWhen, map, concatMap } from 'rxjs/operators';

import { RpcGetPeerInfo, PeerCalculatedStats } from './block-sync.models';
import { Observable } from 'rxjs';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class BlockSyncService {
  private log: any = Log.create('block-sync.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  fetchPeerInfo(): Observable<RpcGetPeerInfo[]> {
    return this._rpc.call('getpeerinfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1}))
    );
  }


  fetchBlockCount(): Observable<number> {
    return this._rpc.call('getblockcount').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1}))
    );
  }


  fetchCalculatedStats(): Observable<PeerCalculatedStats> {
    return this.fetchPeerInfo().pipe(
      concatMap((peers) => this.fetchBlockCount().pipe(
        map((currentBlock) => {
          const highestPeerBlock = this.calculateHighestPeerBlock(peers);
          const remainingBlocks = highestPeerBlock - currentBlock;

          let syncPercentage = -1;
          if ( highestPeerBlock > 0) {
            syncPercentage = Math.min( (currentBlock / highestPeerBlock * 100), 100);
          }

          const stats: PeerCalculatedStats = {
            remainingBlocks,
            highestPeerBlock,
            syncPercentage,
            currentBlock
          }

          return stats;
        })
      ))
    );
  }


  calculateHighestPeerBlock(peerList: RpcGetPeerInfo[]): number {
    let highestBlock = -1;

    peerList.forEach(peer => {
      const peerBlockHeight = +peer.currentheight;

      if (peerBlockHeight > highestBlock) {
        highestBlock = peerBlockHeight;
      }
    });

    return highestBlock;
  }
}
