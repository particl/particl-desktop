import { Component, Input, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, Subject, merge } from 'rxjs';
import { takeUntil, tap, distinctUntilChanged } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SellTemplateFormComponent } from '../../../sell-template-form/sell-template-form.component';
import { TemplateFormDetails } from 'app/main-market/sell/sell.models';


enum TextContent {
  ERROR_IMAGE_ADD = 'One or more images selected were not valid',
}


@Component({
  templateUrl: './imported-template-item.component.html',
  styleUrls: ['./imported-template-item.component.scss']
})
export class ImportTemplateItemComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() onValidityChange: EventEmitter<boolean> = new EventEmitter();

  @Input() template: TemplateFormDetails = null;
  @Input() regions$: Observable<{id: string, name: string}[]>;

  readonly markets$: Observable<{id: number; name: string}[]> = of([]);
  readonly categories$: Observable<{id: number; name: string}[]> = of([]);
  isFormValidControl: FormControl = new FormControl(false);
  importControl: FormControl = new FormControl(true);


  private destroy$: Subject<void> = new Subject();
  @ViewChild(SellTemplateFormComponent, {static: true}) private templateForm: SellTemplateFormComponent;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _snackbar: SnackbarService
  ) {}


  ngOnInit() {
    const validity$ = this.isFormValidControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(isValid => {
        this.importControl.setValue(isValid);

        if (isValid && this.importControl.disabled) {
          this.importControl.enable();
        } else if (!isValid && this.importControl.enabled) {
          this.importControl.disable();
        }
      }),
      takeUntil(this.destroy$)
    );

    const selected$ = this.importControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(isSelected => {
        this.onValidityChange.emit(isSelected);
      }),
      takeUntil(this.destroy$)
    );

    merge(
      validity$,
      selected$
    ).subscribe();
  }


  ngAfterViewInit() {
    this.templateForm.resetFormDetails(this.template);
    this._cdr.detectChanges();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionImageAddError(): void {
    this._snackbar.open(TextContent.ERROR_IMAGE_ADD);
  }

}
