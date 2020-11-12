import { EventEmitter } from '@angular/core';
import { TemplateFormDetails } from '../../sell.models';


export interface ImporterComponent {
  importSuccess: EventEmitter<TemplateFormDetails[]>;
}
