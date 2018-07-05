import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'mat-otpgroup-select-search',
  templateUrl: './mat-otpgroup-select-search.component.html',
  styleUrls: ['./mat-otpgroup-select-search.component.scss']
})
export class MatOtpGroupSelectSearchComponent implements OnInit {
  stateForm: FormGroup = this.fb.group({
    stateGroup: '',
  });
  @Input() defaultOption: string = '';
  @Input() options: any[] = [];
  @Output() change: EventEmitter<any> = new EventEmitter<any>()
  @Input() placeHolder: string = ''
  stateGroupOptions: Observable<any[]>;

  constructor(private fb: FormBuilder) { }

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

    return opt.filter(item => item.name.toLowerCase().indexOf(filterValue) === 0);
  };
}
