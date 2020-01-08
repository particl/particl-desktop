import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective, DebounceClickDirective, ImagePreloadDirective } from './common.directives';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective,
    ImagePreloadDirective
  ],
  exports: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective,
    ImagePreloadDirective
  ],
})
export class DirectiveModule { }
