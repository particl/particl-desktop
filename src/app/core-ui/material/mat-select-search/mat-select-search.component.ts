import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'mat-select-search',
  templateUrl: './mat-select-search.component.html',
  styleUrls: ['./mat-select-search.component.scss']
})
export class MatSelectSearchComponent implements OnInit {
  @Input() public showValueOf: string = 'name'; // default key as 'name'.
  @Input() public placeHolder: string = '';
  @Input() public options: any[] = [];
  @Input() public defaultOption: string = '';
  @Output() onChange: EventEmitter<string | any> = new EventEmitter<string | any>()

  public formControl: FormControl = new FormControl();
  public filteredOptions: Observable<any[]>;

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
    return this.options.filter(option => option[this.showValueOf].toLowerCase().indexOf(filterValue) === 0);
  }
}
