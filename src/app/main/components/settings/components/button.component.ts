import { Component, Input } from '@angular/core';
import { SettingField } from '../abstract-setting.model';


export interface ButtonSettingDetails {
  color: 'primary' | 'accent' | 'warn';
  icon?: string;
}


@Component({
  template: `
    <div class="item">
      <div class="button label">
        <h4 class="option">
          {{ setting?.title }}
          <span class="tag" *ngFor="let tag of setting?.tags">{{ tag }}</span>
          <span class="tag restart-required" *ngIf="setting?.requiresRestart">Requires restart</span>
        </h4>
        <p class="desc" *ngIf="setting?.description?.length > 0">{{ setting.description }}</p>
        <p class="warning" *ngIf="errorMsg">{{errorMsg}}</p>
        <p class="buttons">
          <button mat-button
            [disabled]="setting?.isDisabled === true"
            color="{{ details?.color || 'accent' }}"
            class="validate"
            appDebounceClick (debounceClick)="valueChanged()">
            <mat-icon *ngIf="details?.icon?.length > 0" [fontIcon]="details?.icon"></mat-icon>
            {{ setting?.placeholder || setting?.title }}
          </button>
        </p>
      </div>
    </div>
  `
})
export class ButtonSettingComponent {

  @Input() details: ButtonSettingDetails = {
    color: 'accent',
  };
  @Input() setting: SettingField<null>;

  errorMsg: string = '';


  valueChanged() {
    if (!this.setting.updateValue) {
      return;
    }
    this.setting.updateValue(null);
  }

}
