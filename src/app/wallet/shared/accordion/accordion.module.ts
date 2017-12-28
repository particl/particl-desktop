import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionHeadingComponent } from './accordion-heading/accordion-heading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AccordionHeadingComponent
  ],
  exports: [
    AccordionHeadingComponent
  ]
})
export class AccordionModule { }
