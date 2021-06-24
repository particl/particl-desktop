import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Log } from 'ng2-logger';
import { Subject, Observable, concat, interval, iif, defer, of, merge } from 'rxjs';
import { takeUntil, retryWhen, tap, take, concatMap, map, finalize, catchError, distinctUntilChanged, auditTime, mapTo } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { ZmqConnectionState } from 'app/core/store/zmq-connection.state';
import { GovernanceStateActions } from '../store/governance-store.actions';

import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType } from '../utils';
import { RpcGetBlockchainInfo } from 'app/core/core.models';
import { ResponseProposalDetail, ProposalItem, ResponseTallyVote, TalliedVotes, ResponseVoteHistory, VoteHistoryItem, ResponseSetVote } from './governance.models';



@Injectable()
export class GovernanceService implements OnDestroy {

  readonly AUTO_POLL_TIMEOUT: number = 1_800_000; // 30 minutes

  private log: any = Log.create('governance.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();
  private stopPolling$: Subject<void> = new Subject();
  private isPolling: FormControl = new FormControl(false);

  private DATA_URL: string = 'https://raw.githubusercontent.com/dasource/partyman/master/votingproposals/${chain}/metadata.txt';

  private dataRequest$: Observable<ProposalItem[]> = defer(() => this._http.get(this.DATA_URL).pipe(
    retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2})),
    map((response: ResponseProposalDetail[]) => {
      let items: ProposalItem[] = [];

      const urlParams: string[] = ['ccs', 'github'];

      if (Array.isArray(response)) {
        items = response.map(rpd => {
          //extract received data
          const newItem: ProposalItem = {
            proposalId: 0,
            name: '',
            blockStart: 0,
            blockEnd: 0,
            infoUrls: {},
            network: null,
            voteCast: null,
          };

          if (!isBasicObjectType(rpd)) {
            return newItem;
          }

          newItem.proposalId = getValueOrDefault(rpd.proposalid, 'number', newItem.proposalId);
          newItem.name = getValueOrDefault(rpd.name, 'string', newItem.name);
          newItem.blockStart = getValueOrDefault(rpd.blockheight_start, 'number', newItem.blockStart);
          newItem.blockEnd = getValueOrDefault(rpd.blockheight_end, 'number', newItem.blockEnd);
          newItem.network = rpd.network === 'mainnet' ? 'main' : 'test';

          for (const url of urlParams) {
            const linkParam = `link-${url}`;
            if ((getValueOrDefault(rpd[linkParam], 'string', '').length > 0) && rpd[linkParam].startsWith('https://')) {
              newItem.infoUrls[url] = rpd[linkParam];
            }
          }

          // caters for some weird testnet 'link field that doesn't match the other format
          if ((newItem.network === 'test') && !newItem.infoUrls.github) {
            const testnetlink = getValueOrDefault(rpd.link, 'string', '');
            if ((testnetlink.length > 0) && testnetlink.startsWith('https://github.com/particl/ccs-proposals')) {
              newItem.infoUrls.github = testnetlink;
            }
          }

          return newItem;
        }).filter(proposalItem => (proposalItem.proposalId > 0) && (proposalItem.name.length > 0));
      }

      return items;
    }),
    tap(proposalItems => {
      this._store.dispatch(new GovernanceStateActions.SetProposals(proposalItems));
    }),
    catchError(() => {
      // prevent errors from being thrown... client should use the store to determine if request had an error
      this._store.dispatch(new GovernanceStateActions.SetRetrieveFailedStatus(true));
      return of([]);
    })
  ));

  constructor(
    private _http: HttpClient,
    private _store: Store,
    private _rpc: MainRpcService
  ) {
    this.log.d('starting service...');

    const chain = this._store.selectSnapshot(CoreConnectionState.isTestnet) ? 'testnet' : 'mainnet';
    this.DATA_URL = this.DATA_URL.replace('${chain}', chain);

    const blockWatcher$ = this._store.select(ZmqConnectionState.getData('hashtx')).pipe(
      auditTime(5000),
      concatMap(() => this._rpc.call('getblockchaininfo').pipe(
        retryWhen(genericPollingRetryStrategy({maxRetryAttempts: 1})),
        tap((blockResult: RpcGetBlockchainInfo) => {
          if (isBasicObjectType(blockResult) && !!!blockResult.initialblockdownload && (+blockResult.headers > 0)) {
            const pcntComplete = +Math.fround(+blockResult.blocks / +blockResult.headers * 100).toPrecision(3);
            this._store.dispatch(new GovernanceStateActions.SetBlockValues(+blockResult.blocks, pcntComplete, blockResult.chain));
          }
        })
      )),
      takeUntil(this.destroy$)
    );

    const poller$ = this.isPolling.valueChanges.pipe(
      distinctUntilChanged(),
      tap(newVal => this._store.dispatch(new GovernanceStateActions.SetPollingStatus(newVal))),
      concatMap(value => iif(
        () => !!value,

        defer(() => concat(
          // Make initial request, then on success, poll every 30 minutes
          this.dataRequest$.pipe(take(1)),
          interval(this.AUTO_POLL_TIMEOUT).pipe(
            concatMap(() => this.dataRequest$),
            takeUntil(this.stopPolling$)
          )
        )),

        defer(() => this.stopPolling$.next())
      )),
      finalize(() => this._store.dispatch(new GovernanceStateActions.ResetState())),
      takeUntil(this.destroy$)
    );

    merge(
      blockWatcher$,
      poller$
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }


  ngOnDestroy() {
    this.log.d('stopping service...');
    this.stopPolling$.next();
    this.stopPolling$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  startPolling(): void {
    this.isPolling.setValue(true);
  }


  refreshProposals(): void {
    this.dataRequest$.subscribe();
  }


  fetchProposalResult(proposalId: number, blockStart: number, blockEnd: number): Observable<TalliedVotes> {
    return this._rpc.call('tallyvotes', [proposalId, blockStart, blockEnd]).pipe(
      map((data: ResponseTallyVote) => {
        const allVotes: TalliedVotes = {
          proposalId: 0,
          blocksCounted: 0,
          votes: []
        };

        if (isBasicObjectType(data)) {
          allVotes.proposalId = +data.proposal === proposalId ? +data.proposal : allVotes.proposalId;
          allVotes.blocksCounted = getValueOrDefault(data.blocks_counted, 'number', allVotes.blocksCounted);

          const genericKeys = [ 'proposal', 'blocks_counted', 'height_start', 'height_end', 'option' ];

          for (const key of genericKeys) {
            delete data[key];
          }

          for (const rKey of Object.keys(data)) {
            const voteCount = +(getValueOrDefault(data[rKey] as string, 'string', '').split(',')[0] || '').trim();

            if (voteCount >= 0) {
              allVotes.votes.push({label: rKey, votes: voteCount});
            }
          }
        }

        return allVotes;
      })
    )
  }


  fetchVoteHistory(): Observable<VoteHistoryItem[]> {
    return this._rpc.call('votehistory', [true, true]).pipe(
      catchError(() => of([])),
      map((rpcCastVotes: ResponseVoteHistory[]) => {
        const items: VoteHistoryItem[] = [];

        if (Array.isArray(rpcCastVotes)) {
          rpcCastVotes.forEach(rpcCastVote => {
            if (isBasicObjectType(rpcCastVote)) {
              const voteItem: VoteHistoryItem = {
                proposalId: +rpcCastVote.proposal > 0 ? +rpcCastVote.proposal : 0,
                voteCast: +rpcCastVote.option >= 0 ? +rpcCastVote.option : null,
              };

              if ((voteItem.proposalId !== 0) && voteItem.voteCast !== null) {
                items.push(voteItem);
              }
            }
          });
        }

        return items;
      })
    );
  }


  voteOnProposal(voteCast: number, proposalId: number, blockStart: number, blockEnd: number): Observable<boolean> {
    return defer(() => {
      if ((+voteCast >= 0) && (+proposalId > 0) && (+blockStart >= 0) && (+blockEnd >= 0) && (blockStart <= blockEnd)) {
        return this._rpc.call('setvote', [voteCast === 0 ? 0 : proposalId, voteCast, blockStart, blockEnd]).pipe(
          mapTo(true),
          catchError(() => of(false))
        );
      }
      return of(false);
    });
  }

}
