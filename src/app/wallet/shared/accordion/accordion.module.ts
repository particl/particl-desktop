import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionGroupComponent } from './accordion-group/accordion-group.component';
import { AccordionHeadingComponent } from './accordion-heading/accordion-heading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AccordionGroupComponent,
    AccordionHeadingComponent
  ],
  exports: [
    AccordionGroupComponent,
    AccordionHeadingComponent
  ]
})
export class AccordionModule { }
