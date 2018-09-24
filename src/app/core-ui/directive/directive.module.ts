import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective } from './common.directives';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective
  ],
  exports: [
    FocusDirective,
    FocusTimeoutDirective
  ],
})
export class DirectiveModule { }
