import { Component, Input } from '@angular/core';
import { SettingField } from '../abstract-setting.model';


@Component({
  template: `
    <div class="checkbox label">
      <mat-checkbox
        class="align-top wrap"
        [disabled]="setting?.isDisabled === true"
        [(ngModel)]="setting.value"
        (change)="valueChanged()">
        <h4 class="option">
          {{ setting.title }}
          <span class="tag" *ngFor="let tag of setting?.tags">{{ tag }}</span>
          <span class="tag restart-required" *ngIf="setting?.requiresRestart">Requires restart</span>
        </h4>
        <p class="desc" *ngIf="setting?.description?.length > 0">{{ setting.description }}</p>
      </mat-checkbox>
      <p class="warning" *ngIf="errorMsg">{{errorMsg}}</p>
    </div>
  `
})
export class ToggleSettingComponent {

  @Input() setting: SettingField<boolean>;
  errorMsg: string = '';


  valueChanged() {
    if (!this.setting.updateValue) {
      return;
    }
    this.setting.updateValue(this.setting.value);
  }

}
