import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


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
  @Input() isLexigraphicalOrder: boolean = false;
  @Input() invalidReturnsToPrevious: boolean = false;
  public formControl: FormControl = new FormControl();
  public filteredOptions: Observable<any[]>;

  selectedOption: any;

  /* set default values when options and defaultValue both available.
   * Or if any update.
   */

  ngOnChanges(change: any) {
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
    if (this.isLexigraphicalOrder) {
      return this.options.filter(option => option[this.showValueOf].toLowerCase().startsWith(filterValue));
    }
    return this.options.filter(option => option[this.showValueOf].toLowerCase().includes(filterValue));
  }

  /*
   * Removed focus from the input box when user select any option from the listed options.
   * and emit the selected country value.
   */

  onSelectionChanged($event: any): void {
    // emit selected value.

    if ($event.option && $event.option.value && $event.option.value.name) {
      this.selectedOption = $event.option.value;
      this.onChange.emit($event.option.value);
    }
  }

  onBlur($event: any): void {
    //  TODO: remove this nasty use of setTimeout()
    //    This is not the ideal way to do this, but its the current best interim option
    //    (remove when updating to angular >= 6 or changing this component.)
    setTimeout(() => {
      const currentValidValue = (this.selectedOption ? this.selectedOption.name : this.defaultSelectedValue) || this.defaultSelectedValue;
      if (this.invalidReturnsToPrevious) {
        this.formControl.patchValue(this.selectedOption || this.defaultSelectedValue);
      } else {
        if ($event.target.value !== currentValidValue) {
          this.formControl.reset();
          this.onChange.emit(null);
        } else {
          this.onChange.emit(this.selectedOption);
        }
      }
    }, 300);
  }

  public _selectAllContent($event: any): void {
    $event.target.select();
  }
}
