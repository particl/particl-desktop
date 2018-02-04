import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective } from './custom-focus.directives';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
  ], exports: [
    FocusDirective,
    FocusTimeoutDirective,
  ]
})
export class DirectivesModule { }
