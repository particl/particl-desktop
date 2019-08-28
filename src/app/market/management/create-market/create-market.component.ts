import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-market',
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.scss']
})
export class CreateMarketComponent implements OnInit {

  // stepper form data
  public marketDetailsFormGroup: FormGroup;
  public summaryFormGroup: FormGroup;

  // Create Market > Promote
  public promoDuration = '';

  constructor(
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
  }

}
