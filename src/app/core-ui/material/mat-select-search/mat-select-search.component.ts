import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';


@Component({
  selector: 'mat-select-search',
  templateUrl: './mat-select-search.component.html',
  styleUrls: ['./mat-select-search.component.scss']
})
export class MatSelectSearchComponent implements OnInit, OnChanges {
  @Input() public showValueOf: string = 'name'; // default key as 'name'.
  @Input() public placeHolder: string = '';
  @Input() public options: any[] = [];
  @Input() public defaultOption: string = '';
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() isRequired: boolean = false;
  @Input() defaultSelectedValue: any;
  public formControl: FormControl = new FormControl();
  public filteredOptions: Observable<any[]>;

  /* set default values when options and defaultValue both available.
   * Or if any update.
   */

  ngOnChanges (change: any) {
    if (this.defaultSelectedValue || this.options) {
      this.formControl.patchValue(this.defaultSelectedValue)
    }
  }

  ngOnInit() {
    this.filteredOptions = this.formControl.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          if (!value) {
            return;
          }
          return typeof value === 'string' ? value : value[this.showValueOf]
        }),
        map(val => val ? this._filter(val) : this.options.slice())
      );
  }

  displayFn(option?: any): string | undefined {
    // omit selected value.
    this.onChange.emit(option);
    return option ? option[this.showValueOf] : this.defaultOption;
  }

  private _filter(val: string): any[] {
    if (!val) {
      return [];
    }
    const filterValue = val.toLowerCase();
    return this.options.filter(option => option[this.showValueOf].toLowerCase().includes(filterValue));
  }

  public _onBlur($event: any): void {
    const val = $event.target.value;
    const options = this._filter(val);
    if ((options.length === 0 && this.formControl.value) || !this.formControl.value) {
      this.onChange.emit(null)
    }
  }

  public _selectAllContent($event: any): void {
    $event.target.select();
  }
}
