import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-import-listings',
  templateUrl: './import-listings.component.html',
  styleUrls: ['./import-listings.component.scss']
})
export class ImportListingsComponent implements OnInit {

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  import_sources: Array<any> = [
    { title: 'CSV file',    icon: 'part-image-upload',   value: 'csv' },
    { title: 'WooCommerce', icon: 'part-image-upload',   value: 'woocommerce' }
  ];

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
  }

}
