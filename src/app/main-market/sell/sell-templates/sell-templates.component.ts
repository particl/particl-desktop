import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, of, Observable, defer, forkJoin, merge } from 'rxjs';
import { tap, catchError, takeUntil, switchMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { SellTemplatesService } from './sell-templates.service';
import { DataService } from '../../services/data/data.service';
import { BaseTemplateOverview, TEMPLATE_STATUS_TYPE } from './sell-templates.models';
import { Market } from '../../services/data/data.models';


enum TextContent {
  UNKNOWN_MARKET = '<unknown>'
}

@Component({
  selector: 'market-sell-templates',
  templateUrl: './sell-templates.component.html',
  styleUrls: ['./sell-templates.component.scss'],
  providers: [SellTemplatesService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellTemplatesComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;

  displayedTemplateIdxs: number[] = [];
  allTemplates: BaseTemplateOverview[] = [];

  readonly sortCriteria: {title: string; value: string}[] = [
    {title: 'By Title', value: 'title'},
    {title: 'By Creation', value: 'created'},
    {title: 'By Updated', value: 'updatedLast'}
  ];

  // readonly filterStatusCriteria: {title: string; value: string}[] = [
  //   {title: 'All', value: ''},
  //   {title: 'Unpublished', value: '0'},
  //   {title: 'Published', value: '1'},
  // ];

  searchQuery: FormControl = new FormControl('');
  sortOrder: FormControl = new FormControl('updatedLast');
  // filterStatus: FormControl = new FormControl('');


  private destroy$: Subject<void> = new Subject();
  private marketMap: Map<string, string> = new Map();
  private filteringEvent: FormControl = new FormControl();


  constructor(
    private _cdr: ChangeDetectorRef,
    private _templateService: SellTemplatesService,
    private _dataService: DataService
  ) { }


  ngOnInit() {

    const markets$ = this._dataService.loadMarkets().pipe(
      catchError(() => of([]))
    );

    const templates$ = this._templateService.fetchSavedTemplates().pipe(
      catchError(() => of([]))
    );

    const init$ = forkJoin(markets$, templates$).pipe(
      tap((responses: [Market[], BaseTemplateOverview[]]) => {

        for (const market of responses[0]) {
          if ((market.type === 'MARKETPLACE') || (market.type === 'STOREFRONT_ADMIN')) {
            this.marketMap.set(market.receiveAddress, market.name);
          }
        }

        for (const base of responses[1]) {
          base.marketTemplates.templates.forEach(mt => {
            const mapItem = this.marketMap.get(mt.marketKey);
            mt.marketKey = mapItem ? mapItem : TextContent.UNKNOWN_MARKET;
          });
        }
        this.allTemplates = responses[1];
        this.updateTemplateStatuses();

        this.isLoading = false;
        this.filteringEvent.setValue(null);
      })
    );

    const search$ = this.searchQuery.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const orderBy$ = this.sortOrder.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    const criteriaUpdate$ = merge(
      search$,
      orderBy$
    ).pipe(
      tap(() => {
        this.filteringEvent.setValue(null);
      })
    );

    const processItemsDisplayed$ = this.filteringEvent.valueChanges.pipe(
      switchMap(() => this.doFilteringAction()),
      tap((indexes) => {
        this.displayedTemplateIdxs = indexes;
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    merge(
      init$,
      criteriaUpdate$,
      processItemsDisplayed$
    ).subscribe();

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByOverviewFn(idx: number, item: number) {
    return this.allTemplates[item].id;
  }


  cloneListing(id: number) {
  }

  deleteTemplate(id: number) {
  }


  openPreview(id: number) {

  }


  openBatchPublishModal(): void {
    // const dialog = this._dialog.open(BatchPublishModalComponent);
  }


  openPublishTemplateModal(): void {
    // const dialog = this._dialog.open(PublishTemplateModalComponent);
  }


  private updateTemplateStatuses(): void {
    const now = Date.now();

    for (const baseOverview of this.allTemplates) {
      const hasMarketsOpen = this.marketMap.size > baseOverview.marketTemplates.templates.length;
      let activeMarketCount = 0;

      baseOverview.marketTemplates.templates.forEach(marketOverview => {
        marketOverview.actions.clone = hasMarketsOpen;
        marketOverview.actions.edit = true;
        marketOverview.actions.publish = marketOverview.expires < now;
        marketOverview.actions.delete = !marketOverview.hasHash && (marketOverview.listingsCount === 0) && (marketOverview.expires === 0);

        // TODO: Set status of the market
        marketOverview.status = TEMPLATE_STATUS_TYPE.UNPUBLISHED;

        if (marketOverview.expires > now) {
          activeMarketCount += 1;
        }

      });

      baseOverview.marketTemplates.countActiveMarkets = activeMarketCount;

      baseOverview.actions.clone = true;
      baseOverview.actions.edit = true;
      baseOverview.actions.publish = hasMarketsOpen;
      baseOverview.actions.delete = baseOverview.marketTemplates.templates.length === 0;
    }
  }


  private doFilteringAction(): Observable<number[]> {
    return defer(() => {
      const indexes: number[] = [];

      const searchString = this.searchQuery.value.toLowerCase();
      const sortBy = this.sortOrder.value;

      this.allTemplates.sort(
        (a, b) => b[sortBy] - a[sortBy]
      ).forEach(
        (templ, idx) => {
          if (templ.title.toLowerCase().includes(searchString)) {
            indexes.push(idx);
          }
        }
      );

      return of(indexes);
    });
  }

}
