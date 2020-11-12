import { Component, EventEmitter } from '@angular/core';
import { ImporterComponent } from '../importer.component';
import { TemplateFormDetails } from 'app/main-market/sell/sell.models';


@Component({
  templateUrl: './woocommerce-importer.component.html',
  styleUrls: ['./woocommerce-importer.component.scss']
})
export class WooCommerceImporterComponent implements ImporterComponent {

  importSuccess: EventEmitter<TemplateFormDetails[]> = new EventEmitter();

  constructor() { }

}
