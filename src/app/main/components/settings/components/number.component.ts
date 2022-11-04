import { Component, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { SettingField } from '../abstract-setting.model';


enum TextContent {
  InvalidValue = 'Invalid value provided',
}


export interface NumberSettingDetails {
  min: number;
  max: number;
  step: number;
}


@Component({
  template: `

    <label>
      <h4 class="option">
        {{ setting?.title }}
        <span class="tag" *ngFor="let tag of setting?.tags">{{ tag }}</span>
        <span class="tag restart-required" *ngIf="setting?.restartRequired">Requires restart</span>
      </h4>
      <p class="desc" *ngIf="setting?.description?.length > 0">{{ setting.description }}</p>
      <p class="warning" *ngIf="errorMsg">{{errorMsg}}</p>
      <mat-form-field class="full-width --larger --plain" appearance="fill" [color]="serrorMsg ? 'warn' : 'primary'">
        <input matInput type="number" *ngIf="!details"
          [disabled]="setting?.isDisabled"
          [(ngModel)]="setting.value"
          (change)="valueChanged()">
        <input matInput type="number" *ngIf="details"
          [min]="details.min"
          [step]="details.step"
          [max]="details.max"
          [disabled]="setting?.isDisabled"
          [(ngModel)]="setting.value"
          (change)="valueChanged()">
      </mat-form-field>
    </label>
  `
})
export class NumberSettingComponent implements OnDestroy {

  @Input() details: NumberSettingDetails;
  @Input() setting: SettingField<number>;
  errorMsg: string = '';

  private changeControl: FormControl = new FormControl();
  private destroy$: Subject<void> = new Subject();

  constructor() {
    this.changeControl.valueChanges.pipe(
      debounceTime(400),
      tap({
        next: (value) => {
          this.setting.updateValue(+value);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  valueChanged() {
    if (!this.setting.updateValue) {
      return;
    }
    if (this.details) {
      if (((+this.setting.value % this.details.step) === 0) && (+this.setting.value >= this.details.min) && (+this.setting.value <= this.details.max) ) {
        this.changeControl.setValue(this.setting.value);

        if (this.errorMsg) {
          this.errorMsg = '';
        }
      } else {
        this.errorMsg = TextContent.InvalidValue;
      }
    } else {
      this.changeControl.setValue(this.setting.value);
    }
  }

}
