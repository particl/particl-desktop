import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentComponent {

  constructor() {
  }

}
