import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { SettingField } from '../abstract-setting.model';


function urlValidator(allowEmpty: boolean = false): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value.length === 0) {
      return allowEmpty ? null : { invalidURL: true };
    }
    try {
      const _ = new URL(control.value);
      return null;
    } catch (_) {

      return { invalidURL: true };
    }
  };
}


export interface URLSettingDetails {
  allowEmpty: boolean;
}


@Component({
  template: `

    <label>
      <h4 class="option">
        {{ receivedSettings?.title }}
        <span class="tag --smaller" *ngFor="let tag of receivedSettings?.tags">{{ tag }}</span>
        <span class="tag --smaller --alert" *ngIf="receivedSettings?.requiresRestart === true">Requires restart</span>
      </h4>
      <p class="desc" *ngIf="receivedSettings?.description?.length > 0">{{ receivedSettings.description }}</p>
      <p class="warning" *ngIf="valueControl.invalid || (errorMsg.length > 0)">{{errorMsg || 'Invalid URL'}}</p>
      <mat-form-field class="full-width --larger --plain" appearance="fill" [color]="valueControl.invalid ? 'warn' : 'primary'">
        <input matInput
          [placeholder]="receivedSettings?.placeholder"
          [formControl]="valueControl">
      </mat-form-field>
    </label>
  `
})
export class URLSettingComponent implements OnInit, OnDestroy {

  receivedSettings: SettingField<string>;

  @Input() set details(details: URLSettingDetails) {
    if (details.allowEmpty) {
      this.valueControl.setValidators(urlValidator(true));
      this.valueControl.updateValueAndValidity();
    }
  }
  @Input() set setting(setting: SettingField<string>) {
    this.receivedSettings = setting;
    this.valueControl.setValue(setting.value);
    if (setting.isDisabled) {
      this.valueControl.disable();
    }
  }
  errorMsg: string = '';

  valueControl: FormControl = new FormControl('', {validators: [urlValidator(false)], updateOn: 'blur'});

  private destroy$: Subject<void> = new Subject();


  ngOnInit(): void {
    this.valueControl.valueChanges.pipe(
      tap({
        next: () => {
          if (this.errorMsg.length > 0) {
            this.errorMsg = '';
          }
        }
      }),
      debounceTime(400),
      tap({
        next: (newvalue) => {
          if (this.valueControl.valid && !this.valueControl.disabled && this.receivedSettings.updateValue) {
            this.receivedSettings.updateValue(newvalue);
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
