import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-import-listings',
  templateUrl: './import-listings.component.html',
  styleUrls: ['./import-listings.component.scss']
})
export class ImportListingsComponent implements OnInit {

  import_sources: Array<any> = [
    { title: 'CSV file',    icon: 'part-image-upload',   value: 'csv' },
    { title: 'WooCommerce', icon: 'part-image-upload',   value: 'woocommerce' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
