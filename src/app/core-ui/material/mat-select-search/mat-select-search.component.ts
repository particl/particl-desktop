import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  ElementRef,
  OnInit } from '@angular/core';
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
  @ViewChild('textInput') textInput: ElementRef;
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

  public _onBlur(): void {
    const val = this.textInput.nativeElement.value;
    const options = this._filter(val);
    if ((options.length === 0 && this.formControl.value) || !this.formControl.value) {
      this.onChange.emit(null)
    }
  }

  // Removed focus from the input box when user select any option from the listed options.
  onSelectionChanged(): void {
    this.textInput.nativeElement.blur();
  }

  public _selectAllContent(): void {
    this.textInput.nativeElement.select();
  }
}
