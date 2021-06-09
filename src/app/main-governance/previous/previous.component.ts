import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, combineLatest, Observable, iif, defer, of, merge } from 'rxjs';
import { takeUntil, map, tap, startWith, distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';
import { xorWith } from 'lodash';

import { Store, Select } from '@ngxs/store';
import { GovernanceState } from '../store/governance-store.state';

import { ProposalItem } from '../base/governance.models';


@Component({
  templateUrl: './previous.component.html',
  styleUrls: ['./previous.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviousComponent implements OnInit, OnDestroy {

  @Select(GovernanceState.isBlocksSynced) isBlockchainSynced: Observable<boolean>;

  readonly proposals: Observable<ProposalItem[]>;

  blockCounter: number = 0;
  querySearch: FormControl = new FormControl('');

  private destroy$: Subject<void> = new Subject();
  private applyFilter: FormControl = new FormControl('');


  constructor(
    private _store: Store
  ) {

    const data$ = this._store.select(GovernanceState.previousProposals()).pipe(
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
      )
    ]).pipe(
      map(results => !!results.find(r => r)),
      tap(isFilter => this.applyFilter.setValue(isFilter)),
      takeUntil(this.destroy$)
    );

    const blockCounter$ = this._store.select(GovernanceState.latestBlock).pipe(
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
    this.applyFilter.setValue(false);
  }


  private _filterProposals(proposals: ProposalItem[]): Observable<ProposalItem[]> {
    const searchTerm = (this.querySearch.value as string).toLowerCase();
    return of(proposals.filter(p => {
      return  p.name.toLocaleLowerCase().includes(searchTerm);
    }));
  }

}
