import { Component } from '@angular/core';


/*
 * The MainView is basically:
 * sidebar (optional) +
 * router-outlet
 *
 * Its primary purpose is a shell for rendering of the base main view options.
 */
@Component({
  templateUrl: './extra-base.component.html',
  styleUrls: ['./extra-base.component.scss']
})
export class ExtraBaseComponent {

  constructor() { }
}
