import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion/accordion.component';
import { AccordionGroupComponent } from './accordion-group/accordion-group.component';
import { AccordionHeadingComponent } from './accordion-heading/accordion-heading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AccordionComponent,
    AccordionGroupComponent,
    AccordionHeadingComponent
  ],
  exports: [
    AccordionComponent,
    AccordionGroupComponent,
    AccordionHeadingComponent
  ]
})
export class AccordionModule { }
