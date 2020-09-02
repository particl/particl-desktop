import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, takeUntil, switchMap, map, catchError } from 'rxjs/operators';

import { DataService } from 'app/main-market/services/data/data.service';
import { isBasicObjectType } from 'app/main-market/shared/utils';
import { CategoryItem } from 'app/main-market/services/data/data.models';


export interface CloneTemplateModalInput {
  templateTitle: string;
  markets: {name: string; id: number}[];
}


@Component({
  templateUrl: './clone-template-modal.component.html',
  styleUrls: ['./clone-template-modal.component.scss']
})
export class CloneTemplateModalComponent implements OnInit, OnDestroy {

  readonly productTitle: string = '';
  readonly availableMarkets: {name: string; id: number}[] = [];
  readonly categories$: Observable<CategoryItem[]>;

  selectedMarket: FormControl = new FormControl(0);
  selectedCategory: FormControl = new FormControl(0);


  private destroy$: Subject<void> = new Subject();
  private categoryList$: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([]);


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: CloneTemplateModalInput,
    private _dialogRef: MatDialogRef<CloneTemplateModalComponent>,
    private _sharedService: DataService
  ) {

    if (isBasicObjectType(this.data)) {
      if (Array.isArray(this.data.markets)) {
        this.data.markets.forEach(m => {
          if (isBasicObjectType(m) && (+m.id > 0) && (typeof m.name === 'string')) {
            this.availableMarkets.push({id: m.id, name: m.name});
          }
        });
      }

      if (typeof this.data.templateTitle === 'string') {
        this.productTitle = this.data.templateTitle;
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
