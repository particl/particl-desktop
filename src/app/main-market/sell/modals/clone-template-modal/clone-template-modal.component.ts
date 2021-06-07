import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, takeUntil, switchMap, map, catchError } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';

import { DataService } from '../../../services/data/data.service';
import { isBasicObjectType } from '../../../shared/utils';
import { CategoryItem } from '../../../services/data/data.models';
import { MarketType } from './../../../shared/market.models';


interface AvailableMarket {
  name: string;
  id: number;
  image: string;
  marketType: MarketType;
}


export interface CloneTemplateModalInput {
  templateTitle: string;
  templateImage?: string;
  markets: AvailableMarket[];
}


@Component({
  templateUrl: './clone-template-modal.component.html',
  styleUrls: ['./clone-template-modal.component.scss']
})
export class CloneTemplateModalComponent implements OnInit, OnDestroy {

  readonly productTitle: string = '';
  readonly productImage: string = '';
  readonly availableMarkets: AvailableMarket[] = [];
  readonly categories$: Observable<CategoryItem[]>;

  selectedMarket: FormControl = new FormControl(0);
  selectedCategory: FormControl = new FormControl(0);


  private destroy$: Subject<void> = new Subject();
  private categoryList$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([]);


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CloneTemplateModalInput,
    private _dialogRef: MatDialogRef<CloneTemplateModalComponent>,
    private _sharedService: DataService,
    private _store: Store
  ) {

    if (isBasicObjectType(this.data)) {
      if (Array.isArray(this.data.markets)) {
        this.data.markets.forEach(m => {
          if (isBasicObjectType(m) && (+m.id > 0) && (typeof m.name === 'string')) {
            this.availableMarkets.push({id: m.id, name: m.name, marketType: m.marketType, image: m.image});
          }
        });
      }

      if (typeof this.data.templateTitle === 'string') {
        this.productTitle = this.data.templateTitle;
      }

      if (typeof this.data.templateImage === 'string') {
        this.productImage = this.data.templateImage;
      } else {
        this.productImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
      }
    }

    this.categories$ = this.categoryList$.asObservable();

  }


  ngOnInit() {

    if (this.availableMarkets.length > 0) {

      this.selectedMarket.valueChanges.pipe(
        tap(() => {
          this.categoryList$.next([]);
          this.selectedCategory.setValue(0);
        }),
        map((marketId: number) => {
          // To get the complete list of MARKETPLACE market categories we should NOT pass in a market id to the category search
          let searchedMId: number = undefined;
          const market = this.availableMarkets.find(m => m.id === +marketId);

          if ((market !== undefined) && (market.marketType !== MarketType.MARKETPLACE)) {
            searchedMId = +marketId;
          }
          return searchedMId;
        }),
        switchMap((marketId) => this._sharedService.loadCategories(marketId).pipe(
          map(categories => Array.isArray(categories.categories) ? categories.categories : []),
          catchError(() => of([] as CategoryItem[])),
        )),
        tap(categories => this.categoryList$.next(categories)),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }


  ngOnDestroy() {
    this.categoryList$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  confirmClone() {
    if ((this.availableMarkets.length > 0) && (!this.selectedMarket.value || !this.selectedCategory.value)) {
      return;
    }

    this._dialogRef.close({
      isBaseClone: this.availableMarkets.length === 0,
      marketId: this.selectedMarket.value,
      categoryId: this.selectedCategory.value
    });
  }

}
