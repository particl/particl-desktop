import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FocusDirective, FocusTimeoutDirective, DebounceClickDirective, ImagePreloadDirective, TemplateVariableDirective } from './common.directives';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective,
    ImagePreloadDirective,
    TemplateVariableDirective
  ],
  exports: [
    FocusDirective,
    FocusTimeoutDirective,
    DebounceClickDirective,
    ImagePreloadDirective,
    TemplateVariableDirective
  ],
})
export class DirectiveModule { }
