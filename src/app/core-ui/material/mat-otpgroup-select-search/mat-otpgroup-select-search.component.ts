import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
  OnChanges,
  ViewChild,
  ElementRef,
  OnInit
} from '@angular/core';
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
  @ViewChild('textInput') textInput: ElementRef;

  stateForm: FormGroup = this.fb.group({
    stateGroup: [],
  });
  @Input() defaultOption: any;
  @Input() invalidReturnsToPrevious: boolean = false;
  @Input() options: any[] = [];
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Input() placeHolder: string = '';
  @Input() isRequired: boolean = false;
  @Input() defaultSelectedValue: number;

  stateGroupOptions: Observable<any[]>;
  selectedOption: any;
  constructor(
    private fb: FormBuilder
  ) { }

  /* set default values when options and defaultValue both available.
   * Or if any update.
   */

  ngOnChanges(changes: any) {
    if (this.defaultSelectedValue || this.options) {
      this.stateForm.patchValue({ stateGroup: this.defaultSelectedValue })
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

  private _filterGroup(value: string, from?: string): any[] {
    if (!this.options || !this.options.length) {
      return []
    }

    return this.options
      .map(group => ({ name: group.name, list: this._filter(group.subCategoryList, value, from) }))
      .filter(group => group.list.length > 0);
  }

  displayFn(option?: any): any {
    return option ? option.name : this.defaultOption;
  }

  private _filter = (opt: any[], value: string, from: string): string[] => {
    if (!value) {
      return opt || []
    }

    const filterValue = value.toString().toLowerCase();

    if (from) {
      return opt.filter(item => item.name.toLowerCase() === filterValue);
    }
    return opt.filter(item => item.name.toLowerCase().includes(filterValue));
  };

  /*
   * Removed focus from the input box when user select any option from the listed options.
   * and emit the selected country value.
   */

  onSelectionChanged($event: any): void {
    // emit selected value.
    if ($event.option && $event.option.value && $event.option.value.id) {

      this.selectedOption = $event.option.value;
      this.change.emit($event.option.value);
    }
  }

  onBlur($event: any): void {
    //  TODO: remove this nasty use of setTimeout()
    //    This is not the ideal way to do this, but its the current best interim option
    //    (remove when updating to angular >= 6 or changing this component.)
    setTimeout(() => {
      const currentValidValue = (this.selectedOption ? this.selectedOption.name : this.defaultSelectedValue) || this.defaultSelectedValue;
      if (this.invalidReturnsToPrevious) {
        if ($event.target.value !== currentValidValue) {
          this.stateForm.patchValue({ stateGroup: this.selectedOption || this.defaultSelectedValue });
        }
      } else {
        if ($event.target.value !== currentValidValue) {
          this.stateForm.reset();
          this.change.emit(null);
        } else {
          this.change.emit(this.selectedOption);
        }
      }
    }, 300);
  }

  public _selectAllContent($event: any): void {
    $event.target.select();
  }
}
