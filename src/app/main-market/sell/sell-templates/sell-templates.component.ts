import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, takeUntil, finalize, switchMap, startWith } from 'rxjs/operators';
import { SellService } from '../sell.service';
import { TEMPLATE_SORT_FIELD_TYPE, ListingTemplate, TEMPLATE_STATUS_TYPE } from '../sell.models';
import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';


@Component({
  selector: 'market-sell-templates',
  templateUrl: './sell-templates.component.html',
  styleUrls: ['./sell-templates.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellTemplatesComponent implements OnInit, OnDestroy {

  TEMPLATE_STATUS: typeof TEMPLATE_STATUS_TYPE = TEMPLATE_STATUS_TYPE; // type for template


  readonly sortCriteria: {title: string; value: TEMPLATE_SORT_FIELD_TYPE}[] = [
    {title: 'By Title', value: 'item_informations.title'},
    {title: 'By Creation', value: 'created_at'},
    {title: 'By Updated', value: 'updated_at'}
  ];

  readonly filterStatusCriteria: {title: string; value: string}[] = [
    {title: 'All', value: ''},
    {title: 'Unpublished', value: '0'},
    {title: 'Published', value: '1'},
  ];

  savedTemplates: ListingTemplate[] = [];
  isLoadingMore: boolean = false;

  searchQuery: FormControl = new FormControl();
  sortOrder: FormControl = new FormControl();
  filterStatus: FormControl = new FormControl();


  private destroy$: Subject<void> = new Subject();
  private doFilterChange: FormControl = new FormControl();
  private readonly PAGE_COUNT: number = 30;
  private currentPage: number = 0;


  constructor(
    private _sellService: SellService,
    private _store: Store
  ) {}


  ngOnInit() {
    this.setControlDefaults();

    const search$ = this.searchQuery.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const sort$ = this.sortOrder.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const filterStatus$ = this.filterStatus.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const profile$ = this._store.select(MarketState.currentProfile);

    merge(
      search$,
      sort$,
      filterStatus$,
      profile$
    ).pipe(
      tap(() => {
        this.doFilterChange.setValue(true);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.doFilterChange.valueChanges.pipe(
      tap(() => {
        this.savedTemplates = [];
        this.isLoadingMore = true;
      }),
      switchMap(() => {
        return this.fetchTemplates();
      }),
      takeUntil(this.destroy$)
    ).subscribe(
      (templates: ListingTemplate[]) => {
        this.savedTemplates = templates;
      }
    );

    // Load initial values
    this.doFilterChange.setValue(true);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackBySavedTemplates(idx: number, item: ListingTemplate) {
    return item.id;
  }


  resetFilters() {
    this.setControlDefaults();
  }


  cloneListing(id: number) {
    // TODO
  }

  deleteTemplate(id: number) {
    // TODO
  }


  openPreview(id: number) {
    // TODO
    // const dialog = this._dialog.open(ListingDetailModalComponent);
  }


  private setControlDefaults() {
    this.searchQuery.setValue('');
    this.sortOrder.setValue('updated_at');
    this.filterStatus.setValue('');
  }


  private fetchTemplates(): Observable<ListingTemplate[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;

    return this._sellService.findTemplates(
      profileId,
      this.currentPage,
      this.PAGE_COUNT,
      this.sortOrder.value,
      this.searchQuery.value,
      this.filterStatus.value.length > 0 ? (this.filterStatus.value === '1') : null
    ).pipe(finalize(() => this.isLoadingMore = false));
  }
}
