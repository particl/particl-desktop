import { Component, OnInit } from '@angular/core';

import { TemplateService } from 'app/core/market/api/template/template.service';

import { SellerModel } from './seller-overview.model';

@Component({
  selector: 'seller-overview',
  templateUrl: './seller-overview.component.html',
  styleUrls: ['./seller-overview.component.scss'],
})
export class SellerOverviewComponent implements OnInit {

  statics: SellerModel;

  constructor(private template: TemplateService) {}

  ngOnInit() {
    this.loadStatics();
  }
  // @TODO may be register initially in market-state?
  loadStatics(): void {
    this.template.search(1, 10, 1, null, null).subscribe(
      (listings: Array<any>) => {
        this.statics = new SellerModel(listings);
      }
    )
  }

}
