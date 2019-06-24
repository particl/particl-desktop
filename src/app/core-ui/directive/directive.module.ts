import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective, NoDblClickDirective } from './common.directives';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    NoDblClickDirective
  ],
  exports: [
    FocusDirective,
    FocusTimeoutDirective,
    NoDblClickDirective
  ],
})
export class DirectiveModule { }
