import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, combineLatest, Observable, iif, defer, of, merge } from 'rxjs';
import { takeUntil, map, tap, startWith, distinctUntilChanged, debounceTime, switchMap, shareReplay } from 'rxjs/operators';
import { xorWith } from 'lodash';

import { Store, Select } from '@ngxs/store';
import { GovernanceState } from '../store/governance-store.state';

import { GovernanceService } from './../base/governance.service';

import { ProposalItem } from '../base/governance.models';
import { ChartDataItem } from './../shared/charts/charts.models';


enum TextContent {
  LABEL_STATUS_ALL = 'All',
  LABEL_STATUS_ACTIVE = 'Active',
  LABEL_STATUS_FUTURE = 'Pending',
  LABEL_BLOCKS_REMAINING = 'Remaining',
  LABEL_BLOCKS_COMPLETED = 'Completed',
  LABEL_BLOCKS_TO_START = 'Starting In',
  LABEL_PROPOSAL_DURATION = 'Proposal Duration'
}


@Component({
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentComponent implements OnInit, OnDestroy {

  @Select(GovernanceState.isBlocksSynced) isBlockchainSynced: Observable<boolean>;

  readonly proposals: Observable<ProposalItem[]>;
  readonly filterOptionsStatus: {value: string, title: string}[] = [
    {value: '', title: TextContent.LABEL_STATUS_ALL},
    {value: 'active', title: TextContent.LABEL_STATUS_ACTIVE},
    {value: 'pending', title: TextContent.LABEL_STATUS_FUTURE}
  ];

  blockCounter: number = 0;
  querySearch: FormControl = new FormControl('');
  queryFilterStatus: FormControl = new FormControl('');

  private destroy$: Subject<void> = new Subject();
  private blockCounter$: Observable<number> = this._store.select(GovernanceState.latestBlock).pipe(
    shareReplay(1), takeUntil(this.destroy$)
  );
  private applyFilter: FormControl = new FormControl('');


  constructor(
    private _store: Store,
    private _governService: GovernanceService
  ) {

    const data$ = this._store.select(GovernanceState.currentProposals()).pipe(
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
    );

    const applyFilter$: Observable<boolean> = this.applyFilter.valueChanges.pipe(takeUntil(this.destroy$));

    this.proposals = combineLatest([
      data$,
      applyFilter$
    ]).pipe(
      switchMap(results => iif(
        () => !!results[1],
        defer(() => this._filterProposals(results[0])),
        defer(() => of(results[0]))
      )),
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

    merge(
      blockCounter$,
      filter$
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


  fetchChartBlocksData(startBlock: number, endBlock: number): Observable<ChartDataItem[]> {
    // produces a 'blocks completed' and a 'blocks remaining' items
    return this.blockCounter$.pipe(
      map(currentBlock => {
        const sBlock = +startBlock || 0;
        const eBlock = 1 + (+endBlock || 0);
        const totalBlocks = eBlock - sBlock;
        let completedBlocks = 0;
        let remainingBlocks = 0;

        if (totalBlocks > 1) {
          remainingBlocks = eBlock > currentBlock ? eBlock - currentBlock : 0;
          completedBlocks = totalBlocks - remainingBlocks;
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
    return this._governService.fetchProposalResult(proposalId, startBlock, endBlock).pipe(
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
          }
          return cdi;
        });
      })
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


  private _filterProposals(proposals: ProposalItem[]): Observable<ProposalItem[]> {
    const searchTerm = (this.querySearch.value as string).toLowerCase();
    const status = this.queryFilterStatus.value;

    return of(proposals.filter(p =>
      p.name.toLocaleLowerCase().includes(searchTerm) &&
      ( status === '' ?
        true :
        ( status === 'active' ?
          (p.blockStart !== 0) && (p.blockStart <= this.blockCounter) :
          (p.blockEnd === 0) || (p.blockStart > this.blockCounter)
        )
      )
    ));
  }

}
