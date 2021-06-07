import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Log } from 'ng2-logger';
import { Subject, Observable, concat, interval, iif, defer, of } from 'rxjs';
import { takeUntil, retryWhen, tap, take, concatMap, map, finalize, catchError, distinctUntilChanged } from 'rxjs/operators';

import { Store } from '@ngxs/store';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType } from '../utils';
import { ResponseProposalDetail, ProposalItem } from './governance.models';
import { GovernanceStateActions } from '../store/governance-store.actions';



@Injectable()
export class GovernanceService implements OnDestroy {

  private log: any = Log.create('governance.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();
  private stopPolling$: Subject<void> = new Subject();
  private isPolling: FormControl = new FormControl(false);

  private DATA_URL: string = 'https://raw.githubusercontent.com/dasource/partyman/master/votingproposals/mainnet/metadata.txt';

  private dataRequest$: Observable<ProposalItem[]> = this._http.get(this.DATA_URL).pipe(
    retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 3})),
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
            network: null
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

          return newItem;
        }).filter(proposalItem => {
          // validate ProposalItem 's
          return  (proposalItem.blockStart > 0) &&
                  (proposalItem.blockEnd > 0) &&
                  (proposalItem.blockStart < proposalItem.blockEnd) &&
                  (proposalItem.proposalId > 0)
        });
      }

      return items;
    }),
    tap(proposalItems => {
      // @TODO: PUSH TO STORE HERE
    }),
    catchError(() => {
      // prevent errors from being thrown... client should use the store to determine if request had an error
      this._store.dispatch(new GovernanceStateActions.SetRetrieveFailedStatus(true));
      return of([]);
    })
  );

  constructor(
    private _http: HttpClient,
    private _store: Store,
  ) {
    this.log.d('starting service...');

    this.isPolling.valueChanges.pipe(
      distinctUntilChanged(),
      concatMap(value => iif(
        () => !!value,

        defer(() => concat(
          // Make initial request, then on success, poll every 30 minutes
          this.dataRequest$.pipe(take(1)),
          interval(1800000).pipe(
            concatMap(() => this.dataRequest$),
            takeUntil(this.stopPolling$)
          )
        )),

        defer(() => this.stopPolling$.next())
      )),
      finalize(() => this._store.dispatch(new GovernanceStateActions.ResetState())),
      takeUntil(this.destroy$)
    ).subscribe();
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
}
