import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective, DebounceClickDirective } from './common.directives';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective
  ],
  exports: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective
  ],
})
export class DirectiveModule { }
