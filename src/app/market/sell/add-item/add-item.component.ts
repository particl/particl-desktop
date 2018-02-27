import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { Category } from 'app/core/market/api/category/category.model';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';

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

  itemFormGroup: FormGroup;

  _rootCategoryList: Category = new Category({});

  dropArea: any;
  fileInput: any;
  pictures: string[];
  featuredPicture: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private category: CategoryService,
    private template: TemplateService,
    private listing: ListingService
  ) { }

  ngOnInit() {

    // TODO: drag and drop
    this.dropArea = document.getElementById('drag-n-drop');

    this.fileInput = document.getElementById('fileInput');
    this.fileInput.onchange = this.processPictures.bind(this);
    this.pictures = new Array();

    this.subToCategories();

    this.itemFormGroup = this.formBuilder.group({
      title:                      ['', [Validators.required]],
      shortDescription:           ['', [Validators.required]],
      longDescription:            ['', [Validators.required]],
      categories:                 ['', [Validators.required]],
      basePrice:                  ['', [Validators.required]],
      domesticShippingPrice:      ['', [Validators.required]],
      internationalShippingPrice: ['', [Validators.required]]
    });

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

    // this.listing.generateListing().take(1).subscribe(listing => {
    //   console.log(listing);
    //   this.listing.get(1).take(1).subscribe(res => {
    //     console.log(res);
    //   })
    // });
  }

  uploadPicture() {
    this.fileInput.click();
  }

  processPictures(event) {
    Array.from(event.target.files).map((file: File) => {
      let reader = new FileReader();
      reader.onload = event => {
        this.pictures.push(reader.result.split('base64,')[1]);
        this.log.d('added picture', file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  removePicture(index) {
    this.pictures.splice(index, 1);
    if (this.featuredPicture > index) {
      this.featuredPicture -= 1;
    }
  }

  featurePicture(index) {
    this.featuredPicture = index;
  }

  subToCategories() {
    this.category.list()
      .takeWhile(() => !this.destroyed)
      .subscribe(list => this.updateCategories(list));
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
    this.template.get(this.templateId).subscribe((template: any) => {
      this.log.d(`preloaded id=${this.templateId}!`)

      let itemPrice = template.ItemInformation.ItemPrice;

      template.ItemInformation.basePrice = itemPrice.basePrice;
      template.ItemInformation.domesticShippingPrice = itemPrice.ShippingPrice.domestic;
      template.ItemInformation.internationalShippingPrice = itemPrice.ShippingPrice.international;

      this.itemFormGroup.setValue(template.ItemInformation);
    });
  }

// template add 1 "title" "short" "long" 80 "SALE" "PARTICL" 5 5 5 "Pasdfdfd"
  save(): Promise<any> {

    let item = this.itemFormGroup.value;
    let nPicturesAdded = 0;

    return new Promise((resolve, reject) => {

      this.template.add(
        item.title,
        item.shortDescription,
        item.longDescription,
        75, // TODO: replace
        'SALE',
        'PARTICL',
        +item.basePrice,
        +item.domesticShippingPrice,
        +item.internationalShippingPrice
      ).take(1).subscribe(template => {

        this.log.d('Saved template', template);
        this.pictures.map(picture => {

          this.template.addPicture(template.id, picture).take(1).subscribe(res => {
            console.log(res);
            if (++nPicturesAdded === this.pictures.length) {
              resolve(template.id);
            }
          });

        }); /* map pictures */
      }); /* template add */
    }); /* promise */
  }

  saveAndPublish() {
    this.log.d('saveAndPublish');
    this.save().then(id => {
      this.template.post(id, 1).take(1).subscribe(listing => {
        console.log(listing);
      });
    });
  }

  update() {

  }
}
