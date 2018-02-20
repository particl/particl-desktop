import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  
  categories: FormControl = new FormControl();
  categoryList: Array<any> = [
    {
      name: 'Electronics',
      subcategory: [
        { value: '01', viewValue: 'Computers' },
        { value: '02', viewValue: 'Laptops' },
        { value: '03', viewValue: 'Components' }
      ]
    },
    {
      name: 'Hobby',
      subcategory: [
        { value: '04', viewValue: 'Hardware' },
        { value: '05', viewValue: 'DIY stuff' },
        { value: '06', viewValue: 'Chains' }
      ]
    },
    {
      name: 'Health & Beauty',
      subcategory: [
        { value: '01', viewValue: 'Alcohol' },
        { value: '02', viewValue: 'Cosmetics' },
        { value: '03', viewValue: 'BIO whatever' }
      ]
    },
    {
      name: 'Toys',
      subcategory: [
        { value: '01', viewValue: 'For boys' },
        { value: '02', viewValue: 'For girls' },
        { value: '03', viewValue: 'For adults ;)' }
      ]
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  backToSell() {
    this.router.navigate(['/market/sell']);
  }

}
