import { Component, Input } from '@angular/core';
import { SettingField } from '../abstract-setting.model';


export interface SelectSettingField extends SettingField<string | number> {
  options: {label: string; value: string | number; isDisabled?: boolean }[];
}


@Component({
  template: `

    <label>
      <h4 class="option">
        {{ setting?.title }}
        <span class="tag --smaller" *ngFor="let tag of setting?.tags">{{ tag }}</span>
        <span class="tag --smaller --alert" *ngIf="setting?.restartRequired">Requires restart</span>
      </h4>
      <p class="desc" *ngIf="setting?.description?.length > 0">{{ setting.description }}</p>
      <p class="warning" *ngIf="setting.errorMsg">{{setting.errorMsg}}</p>
      <mat-form-field class="full-width --larger --plain" appearance="fill" [color]="setting.errorMsg ? 'warn' : 'primary'">
        <mat-select [disabled]="setting?.isDisabled" [(ngModel)]="setting.value" (selectionChange)="valueChanged()">
          <mat-option *ngFor="let option of setting?.options" [value]="option.value" [disabled]="option.isDisabled">
            {{ option.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </label>
  `
})
export class SelectSettingComponent {

  @Input() setting: SelectSettingField;
  errorMsg: string = '';

  constructor() { }

  valueChanged() {
    if (!this.setting || !this.setting.updateValue) {
      return;
    }
    this.setting.updateValue(this.setting.value);
  }

}
