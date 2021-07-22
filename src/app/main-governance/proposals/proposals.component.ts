import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, combineLatest, Observable, iif, defer, of, merge, timer } from 'rxjs';
import {
  takeUntil, map, tap, startWith, distinctUntilChanged, debounceTime, switchMap, shareReplay, take, concatMap, takeWhile
} from 'rxjs/operators';
import { xorWith } from 'lodash';

import { Store, Select } from '@ngxs/store';
import { GovernanceState } from '../store/governance-store.state';
import { WalletInfoState, WalletStakingState } from 'app/main/store/main.state';

import { GovernanceService } from './../base/governance.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SetVoteModalComponent, ProposalModalData } from './set-vote-modal/set-vote-modal.component';

import { ProposalItem } from '../base/governance.models';
import { ChartDataItem } from './../shared/charts/charts.models';


enum TextContent {
  LABEL_STATUS_ALL = 'All',
  LABEL_STATUS_ACTIVE = 'Active',
  LABEL_STATUS_FUTURE = 'Pending',
  LABEL_STATUS_COMPLETE = 'Complete',
  LABEL_BLOCKS_REMAINING = 'Remaining',
  LABEL_BLOCKS_COMPLETED = 'Completed',
  LABEL_BLOCKS_TO_START = 'Starting In',
  LABEL_PROPOSAL_DURATION = 'Proposal Duration',
  SET_VOTE_FAILED = 'An error occurred while setting the proposal\'s vote'
}


@Component({
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProposalsComponent implements OnInit, OnDestroy {

  @Select(GovernanceState.isBlocksSynced) isBlockchainSynced: Observable<boolean>;

  readonly currentProposals$: Observable<ProposalItem[]>;
  readonly previousProposals$: Observable<ProposalItem[]>;
  readonly canRefresh$: Observable<boolean>;
  readonly refreshCountdown$: Observable<string>;
  readonly isColdStaking$: Observable<boolean>;

  readonly filterOptionsStatus: {value: string, title: string}[] = [
    {value: '', title: TextContent.LABEL_STATUS_ALL},
    {value: 'pending', title: TextContent.LABEL_STATUS_FUTURE},
    {value: 'active', title: TextContent.LABEL_STATUS_ACTIVE},
    {value: 'complete', title: TextContent.LABEL_STATUS_COMPLETE}
  ];

  blockCounter: number = 0;
  querySearch: FormControl = new FormControl('');
  queryFilterStatus: FormControl = new FormControl('');


  private destroy$: Subject<void> = new Subject();
  private blockCounter$: Observable<number> = this._store.select(GovernanceState.latestBlock).pipe(
    shareReplay(1), takeUntil(this.destroy$)
  );
  private applyFilter: FormControl = new FormControl(false);
  private performRefresh$: Observable<never>;
  private canRefreshControl: FormControl = new FormControl(true);
  private forceUpdateCurrentControl: FormControl = new FormControl();


  constructor(
    private _store: Store,
    private _governService: GovernanceService,
    private _unlocker: WalletEncryptionService,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService
  ) {

    const applyFilter$: Observable<boolean> = this.applyFilter.valueChanges.pipe(
      startWith(this.applyFilter.value),
      takeUntil(this.destroy$)
    );

    const proposalData$: Observable<ProposalItem[]> = combineLatest([

      this._store.select(WalletInfoState.getValue('walletname')).pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this._store.select(GovernanceState.currentProposals()).pipe(
        startWith([] as ProposalItem[]),
        distinctUntilChanged((x, y) =>
          (x.length === y.length) ||
          xorWith<ProposalItem>(
            x,
            y,
            (curr: ProposalItem, req: ProposalItem) =>
                (curr.proposalId === req.proposalId) &&
                (curr.blockStart === req.blockStart) &&
                (curr.blockEnd === req.blockEnd)
          ).length === 0
        ),
        takeUntil(this.destroy$)
      ),

      this.forceUpdateCurrentControl.valueChanges.pipe(startWith(0), takeUntil(this.destroy$))

    ]).pipe(
      switchMap(data => {
        const currentProposals = data[1];

        return iif(
          () => currentProposals.length === 0,
          defer(() => of(currentProposals)),
          defer(() => this._governService.fetchVoteHistory().pipe(
            map(currentVotes => {
              const pvSet = new Set(currentVotes.map(cv => cv.proposalId));

              for (let ii = 0; ii < currentProposals.length; ii++) {
                const proposal = currentProposals[ii];
                let voteCast: number = null;
                if (pvSet.has(proposal.proposalId)) {
                  voteCast = currentVotes.find(cv => cv.proposalId === proposal.proposalId).voteCast;
                }
                currentProposals[ii] = {...proposal, voteCast};
              }

              return currentProposals;
            })
          ))
        );

      })
    );

    this.currentProposals$ = combineLatest([
      proposalData$,
      applyFilter$
    ]).pipe(
      switchMap(results => iif(
        () => !!results[1],
        defer(() => this._filterProposals(results[0])),
        defer(() => of(results[0]))
      )),
    );


    this.previousProposals$ = combineLatest([

      this._store.select(GovernanceState.previousProposals()).pipe(
        startWith([] as ProposalItem[]),
        distinctUntilChanged((x, y) =>
          (x.length === y.length) ||
          xorWith<ProposalItem>(
            x,
            y,
            (curr: ProposalItem, req: ProposalItem) =>
                (curr.proposalId === req.proposalId) &&
                (curr.blockStart === req.blockStart) &&
                (curr.blockEnd === req.blockEnd)
          ).length === 0
        ),
        takeUntil(this.destroy$)
      ),

      applyFilter$

    ]).pipe(
      switchMap(results => iif(
        () => !!results[1],
        defer(() => this._filterProposals(results[0])),
        defer(() => of(results[0]))
      )),
    );


    // set up the observable for actually performing a refresh action
    this.performRefresh$ = defer(() => {
      this.canRefreshControl.setValue(false);
      this._governService.refreshProposals();
    });

    // determine if the refresh button is enabled or not
    this.canRefresh$ = combineLatest([
      this._store.select(GovernanceState.isBlocksSynced).pipe(distinctUntilChanged(), takeUntil(this.destroy$)),
      this.canRefreshControl.valueChanges.pipe(
        startWith(this.canRefreshControl.value),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ) as Observable<boolean>,
    ]).pipe(
      map(statuses => statuses[0] && statuses[1])
    );

    // set up countdown to when the next auto refresh is taking place
    this.refreshCountdown$ = combineLatest([
      timer(Date.now() % 1000, 1000).pipe(takeUntil(this.destroy$)),
      this._store.select(GovernanceState.lastSyncTime).pipe(takeUntil(this.destroy$)),
      this._store.select(GovernanceState.pollingStatus).pipe(takeUntil(this.destroy$)),
    ]).pipe(
      map(values => {
        if (!values[2] || +values[1] <= 0) {
          return 0;
        }
        const currentTime = Math.round(Date.now() / 1000);
        const expiryTime = Math.round((+values[1] + this._governService.AUTO_POLL_TIMEOUT) / 1000);
        const remainingSeconds = expiryTime - currentTime;

        if (remainingSeconds <= 0) {
          return 0;
        }
        return remainingSeconds;
      }),
      distinctUntilChanged(),
      map(secs => {
        let timestring = '';

        if (secs > 0) {
          // @TODO: zaSmilingIdiot 2021-06-10 -> Improve this type of crappy string building for translations
          const seconds = Math.floor(secs % 60),
                minutes = Math.floor((secs / 60) % 60);

          timestring = `${minutes.toString().padStart(2, '0')} m ${seconds.toString().padStart(2, '0')} s`;
        }
        return timestring;
      }),
      takeUntil(this.destroy$)
    );

    // set up cold-staking check
    this.isColdStaking$ = this._store.select(WalletStakingState.getValue('cold_staking_enabled')).pipe(
      map((val: boolean) => val),
      shareReplay(1),
      takeUntil(this.destroy$)
    );
  }


  ngOnInit() {
    const filter$ = combineLatest([
      this.querySearch.valueChanges.pipe(
        startWith(this.querySearch.value),
        debounceTime(400),
        distinctUntilChanged(),
        map(value => value !== ''),
        takeUntil(this.destroy$)
      ),
      this.queryFilterStatus.valueChanges.pipe(
        startWith(this.queryFilterStatus.value),
        map(value => value !== ''),
        takeUntil(this.destroy$)
      )
    ]).pipe(
      map(results => !!results.find(r => r)),
      tap(isFilter => this.applyFilter.setValue(isFilter)),
      takeUntil(this.destroy$)
    );

    const blockCounter$ = this.blockCounter$.pipe(
      tap(bc => this.blockCounter = bc),
      takeUntil(this.destroy$)
    );

    // prevent timeout if a refresh was recently performed
    const msRefreshTimeout = 5 * 1000;
    const refreshChecker$ = this._store.select(GovernanceState.lastSyncTime).pipe(
      switchMap(updateTime => iif(
        () => (updateTime + msRefreshTimeout) <= Date.now(),
        defer(() => of(true)),
        defer(() => timer(msRefreshTimeout).pipe(map(() => true)))
      )),
      tap(value => this.canRefreshControl.setValue(value)),
      takeUntil(this.destroy$)
    );

    merge(
      blockCounter$,
      filter$,
      refreshChecker$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  clearAllFilters(): void {
    this.querySearch.setValue('', {emitEvent: false});
    this.queryFilterStatus.setValue('', {emitEvent: false});

    this.applyFilter.setValue(false);
  }


  refreshProposals() {
    this.performRefresh$.subscribe();
  }


  fetchChartBlocksData(startBlock: number, endBlock: number): Observable<ChartDataItem[]> {
    // produces a 'blocks completed' and a 'blocks remaining' items
    return this.blockCounter$.pipe(
      map(currentBlock => {
        const sBlock = +startBlock || 0;
        const eBlock = (+endBlock || 0);
        const totalBlocks = eBlock - sBlock;
        let completedBlocks = 0;
        let remainingBlocks = 0;

        if (totalBlocks > 1) {
          remainingBlocks = eBlock > currentBlock ? eBlock - currentBlock : 0;
          completedBlocks = totalBlocks - remainingBlocks + 1;
        }

        const completed: ChartDataItem = {
          name: TextContent.LABEL_BLOCKS_COMPLETED,
          value: completedBlocks,
          itemStyle: {
            color: '#3ecf8a'
          },
          label: {
            show: completedBlocks > 0,
          }
        };

        const remaining: ChartDataItem = {
          name: TextContent.LABEL_BLOCKS_REMAINING,
          value: remainingBlocks,
          itemStyle: {
            color: '#373d3e'
          },
          label: {
            show: remainingBlocks > 0,
          }
        };

        return [remaining, completed];
      })
    );
  }


  fetchChartVoteData(proposalId: number, startBlock: number, endBlock: number): Observable<ChartDataItem[]> {
    const voteTally$ = this._governService.fetchProposalResult(proposalId, startBlock, endBlock).pipe(
      map(data => {
        if (data.proposalId !== proposalId) {
          return [];
        }

        return data.votes.map(vote => {
          const cdi: ChartDataItem = {
            name: vote.label,
            value: vote.votes,
            label: {
              show: vote.votes > 0
            }
          };
          // temporary measure to attempt showing a gray colour for non-cast votes: temporary because it'll possibly fail if using different languages
          if (vote.label === 'Abstain') {
            cdi.itemStyle = { color: '#858c92' };
          }
          return cdi;
        });
      })
    );

    return this.blockCounter$.pipe(
      take(1),
      concatMap(currentBlock => iif(
        // request vote tally once to check if proposal has completed.
        () => currentBlock > endBlock,
        // proposal already completed, so request tallied votes only once
        voteTally$,
        // proposal still voting, so for each new block received, re-request vote tally (until proposal has completed)
        this.blockCounter$.pipe(
          takeWhile(cb => cb <= endBlock),
          switchMap(() => voteTally$)
        )
      ))
    );
  }


  fetchChartStartBlocksCountdown(blockStart: number, blockEnd: number): Observable<ChartDataItem[]> {
    return this.blockCounter$.pipe(
      map(currentBlock => {

        const remainingBlocks = +blockStart - currentBlock;
        const durationBlocks = (+blockEnd || 0) - (+blockStart || 0);

        const remaining: ChartDataItem = {
          name: TextContent.LABEL_BLOCKS_TO_START,
          value: remainingBlocks >= 0 ? remainingBlocks : 0,
          itemStyle: {
            color: '#51429f'
          },
          label: {
            show: remainingBlocks > 0,
          }
        };

        const duration: ChartDataItem = {
          name: TextContent.LABEL_PROPOSAL_DURATION,
          value: durationBlocks > 0 ? durationBlocks : 0,
          itemStyle: {
            color: '#999fa5'
          },
          label: {
            show: durationBlocks > 0,
          }
        };

        return [remaining, duration];
      })
    );
  }


  voteOnProposal(proposalId: number, blockStart: number, blockEnd: number, proposalTitle: string, currentVote: number | null): void {
    if ((+proposalId > 0) && (+blockStart > 0) && (+blockEnd > 0) && (blockStart < blockEnd)) {

      const proposalData: ProposalModalData = {
        proposalId,
        proposalTitle,
        existingVote: currentVote,
      };

      this._dialog.open(SetVoteModalComponent, {data: proposalData}).afterClosed().pipe(
        take(1),
        concatMap((voteCast: number | null | undefined) => iif(

          () => (typeof voteCast === 'number') && (+voteCast >= 0),

          defer(() => this._unlocker.unlock({timeout: 10}).pipe(
            concatMap(unlocked => iif(
              () => unlocked,

              defer(() => this._governService.voteOnProposal(voteCast, proposalId, blockStart, blockEnd).pipe(
                tap(success => {
                  if (success) {
                    this.forceUpdateCurrentControl.setValue(0);
                  } else {
                    this._snackbar.open(TextContent.SET_VOTE_FAILED, 'err');
                  }
                })
              ))

            ))

          ))
        ))
      ).subscribe();
    }
  }


  private _filterProposals(proposals: ProposalItem[]): Observable<ProposalItem[]> {
    const searchTerm = (this.querySearch.value as string).toLowerCase();
    const status = this.queryFilterStatus.value;

    return of(proposals.filter(p => {
      let s = false;
      switch (status) {
        case '' : s = true; break;
        case 'pending' : s = (p.blockEnd === 0) || (p.blockStart > this.blockCounter); break;
        case 'active' : s = (p.blockEnd !== 0) && (p.blockStart <= this.blockCounter) && (p.blockEnd > this.blockCounter); break;
        case 'complete' : s = (p.blockEnd !== 0) && (p.blockEnd <= this.blockCounter); break;
      }
      return p.name.toLocaleLowerCase().includes(searchTerm) && s;
    }));
  }

}
