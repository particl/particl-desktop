import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { SettingField } from '../abstract-setting.model';


enum TextContent {
  InvalidValue = 'Invalid URL',
}


function urlValidator(allowEmpty: boolean = false): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value.length === 0) {
      return allowEmpty ? null : { invalidURL: true };
    }
    try {
      new URL(control.value);
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
        <span class="tag --smaller --alert" *ngIf="receivedSettings?.restartRequired === true">Requires restart</span>
      </h4>
      <p class="desc" *ngIf="receivedSettings?.description?.length > 0">{{ receivedSettings.description }}</p>
      <p class="warning" *ngIf="valueControl.invalid">{{errorMsg}}</p>
      <mat-form-field class="full-width --larger --plain" appearance="fill" [color]="errorMsg ? 'warn' : 'primary'">
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
  };
  @Input() set setting(setting: SettingField<string>) {
    this.receivedSettings = setting;
    this.valueControl.setValue(setting.value);
    if (setting.isDisabled) {
      this.valueControl.disable();
    }
  };
  errorMsg: string = TextContent.InvalidValue;

  private valueControl: FormControl = new FormControl('', [urlValidator(false)]);
  private destroy$: Subject<void> = new Subject();


  ngOnInit(): void {
    this.valueControl.valueChanges.pipe(
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
