import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { Category } from 'app/core/market/api/category/category.model';
import { TemplateService } from 'app/core/market/api/template/template.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit, OnDestroy {

  log: any = Log.create('add-item.component');
  private destroyed: boolean = false;

  // template id
  templateId: number = 2;

  // template info
  title = new FormControl();
  shortDesc = new FormControl();
  longDesc = new FormControl();
  categories: FormControl = new FormControl();
  price: FormControl = new FormControl();
  domesticShippingPrice: FormControl = new FormControl();
  internationalShippingPrice: FormControl = new FormControl();

  _rootCategoryList: Category = new Category({});

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private category: CategoryService,
    private template: TemplateService
  ) { }

  ngOnInit() {
    this.subToCategories();

    this.route.queryParams.take(1).subscribe(params => {
      const id = params['id'];
      const clone = params['clone'];
      if (id) {
        this.templateId = +id;
        this.preload();
      }

      if (clone === true) {
        this.templateId = undefined;
      }
   });
   
  }

  subToCategories() {
    this.category.list()
    .takeWhile(() => !this.destroyed)
    .subscribe(
      list => this.updateCategories(list));
  }

  updateCategories(list: Category) {
    this.log.d('Updating category list');
    this._rootCategoryList = list;
  }

  backToSell() {
    this.router.navigate(['/market/sell']);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  preload() {
    this.log.d(`preloading for id=${this.templateId}`);
    this.template.get(this.templateId).subscribe(
      (template: any) => {
        this.log.d(`preloaded id=${this.templateId}!`)
        this.title.setValue(template.ItemInformation.title);
        this.shortDesc.setValue(template.ItemInformation.shortDescription);
        this.longDesc.setValue(template.ItemInformation.longDescription);
        this.price.setValue(template.PaymentInformation.ItemPrice.basePrice);
        this.domesticShippingPrice.setValue(template.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        this.internationalShippingPrice.setValue(template.PaymentInformation.ItemPrice.ShippingPrice.international);
      }
    );
  }

// template add 1 "title" "short" "long" 80 "SALE" "PARTICL" 5 5 5 "Pasdfdfd"
  save() {
    this.template.add(
      this.title.value,
      this.shortDesc.value,
      this.longDesc.value,
      75, // TODO: replace
      'SALE',
      'PARTICL',
      +this.price.value,
      +this.domesticShippingPrice.value,
      +this.internationalShippingPrice.value
    ).subscribe(
      (template) => { this.log.d('Saved template!'); }
    );
  }

  saveAndPublish() {
    this.save();
    this.log.d('saveAndPublish');
  }

  update() {

  }
}
