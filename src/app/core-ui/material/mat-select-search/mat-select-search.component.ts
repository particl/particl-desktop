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
  @Input() public disabled: boolean
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() isRequired: boolean = false;
  @Input() defaultSelectedValue: any;
  public formControl: FormControl = new FormControl();
  public filteredOptions: Observable<any[]>;

  /* set default values when options and defaultValue both available.
   * Or if any update.
   */

  ngOnChanges (change: any) {

    // check for detected change for disabled var
    if (change.disabled) {

      if (this.disabled) {
        this.formControl.disable()
      } else {
        this.formControl.enable();
      }

    }

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
    return option ? option[this.showValueOf] : this.defaultOption;
  }

  private _filter(val: string, from?: string): any[] {
    if (!val) {
      return [];
    }
    const filterValue = val.toLowerCase();
    if (from) {
      return this.options.filter(option => option[this.showValueOf].toLowerCase() === filterValue);
    }
    return this.options.filter(option => option[this.showValueOf].toLowerCase().includes(filterValue));
  }

  /*
   * Removed focus from the input box when user select any option from the listed options.
   * and emit the selected country value.
   */

   onSelectionChanged($event: any): void {
    // omit selected value.
    this.onChange.emit($event.option.value);
    this.textInput.nativeElement.blur();
  }

  onBlur($event: any): void {
    if ($event.target.value === this.defaultOption) {
      return;
    }

    if (this._filter($event.target.value, 'blur').length === 0) {
      this.textInput.nativeElement.value = '';
    }
  }

  public _selectAllContent($event: any): void {
    $event.target.select();
  }
}
