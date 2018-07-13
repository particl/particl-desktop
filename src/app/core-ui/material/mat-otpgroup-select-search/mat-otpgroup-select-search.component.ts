import { Component, Input, Output, EventEmitter, SimpleChange, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { CategoryService } from 'app/core/market/api/category/category.service';

@Component({
  selector: 'mat-otpgroup-select-search',
  templateUrl: './mat-otpgroup-select-search.component.html',
  styleUrls: ['./mat-otpgroup-select-search.component.scss']
})
export class MatOtpGroupSelectSearchComponent implements OnInit, OnChanges {
  stateForm: FormGroup = this.fb.group({
    stateGroup: '',
  });
  @Input() defaultOption: string = '';
  @Input() options: any[] = [];
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Input() placeHolder: string = '';
  @Input() isRequired: boolean = false;
  @Input() defaultSelectedValue: number;

  stateGroupOptions: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private countryListService: CategoryService
  ) { }

  // detect default value change and set the selected value.
  ngOnChanges(changes: any) {
    if (this.defaultSelectedValue && this.options) {
      // @TODO change the set value mechanism more generic.

      this.stateForm.patchValue({
        stateGroup: this.countryListService.getCategoryByCategoryId(
          this.options,
          this.defaultSelectedValue
        )
      })
    }
  }

  ngOnInit() {
    this.stateGroupOptions = this.stateForm.get('stateGroup')!.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          return this._filterGroup(value)
        })
      );
  }

  private _filterGroup(value: string): any[] {
    if (!this.options || !this.options.length) {
      return []
    }

    if (value) {
      return this.options
        .map(group => ({ name: group.name, subCategoryList: this._filter(group.subCategoryList, value) }))
        .filter(group => group.subCategoryList.length > 0);
    }
    return this.options;
  }

  displayFn(option?: any): any {
    this.change.emit(option);
    return option ? option.name : this.defaultOption;
  }

  private _filter = (opt: any[], value: string): string[] => {
    if (!value) {
      return opt || []
    }

    const filterValue = typeof value === 'string' ? value.toLowerCase() : value['name'].toLowerCase();

    return opt.filter(item => item.name.toLowerCase().includes(filterValue));
  };

  /* `_onBlur` detect if any option not selected
   * and input constains any value then selected value should
   */

  public _onBlur($event: any): void {
    const val = $event.target.value;
    const options = this._filterGroup(val);
    if (options.length === 0 || this.stateForm.get('stateGroup').value) {
      this.change.emit(null)
    }
  }

  public _selectAllContent($event: any): void {
    $event.target.select();
  }
}
