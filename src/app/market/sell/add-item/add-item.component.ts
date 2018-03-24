import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { Category } from 'app/core/market/api/category/category.model';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Template } from 'app/core/market/api/template/template.model';
import { CountryList } from 'app/core/market/api/listing/countrylist.model';

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
  countries: CountryList = new CountryList();
  images: string[];
 
  // file upload 
  dropArea: any;
  fileInput: any;
  picturesToUpload: string[];
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
    this.picturesToUpload = new Array();

    this.subToCategories();

    this.itemFormGroup = this.formBuilder.group({
      title:                      ['', [Validators.required]],
      shortDescription:           ['', [Validators.required,
                                        Validators.maxLength(200)]],
      longDescription:            ['', [Validators.required,
                                        Validators.maxLength(1000)]],
      category:                 ['', [Validators.required]],
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
    /*
    this.listing.generateListing().take(1).subscribe(listing => {
      console.log(listing);
      this.listing.get(1).take(1).subscribe(res => {
        console.log(res);
      })
     });*/
  }

  uploadPicture() {
    this.fileInput.click();
  }

  processPictures(event) {
    Array.from(event.target.files).map((file: File) => {
      const reader = new FileReader();
      reader.onload = event => {
        this.picturesToUpload.push(reader.result);
        this.log.d('added picture', file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  removePicture(index) {
    this.picturesToUpload.splice(index, 1);
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
    this.template.get(this.templateId).subscribe((template: Template) => {
      this.log.d(`preloaded id=${this.templateId}!`)

      const t = {
        title: '',
        shortDescription: '',
        longDescription: '',
        category: 0,
        basePrice: 0,
        domesticShippingPrice: 0,
        internationalShippingPrice: 0

      };

      console.log(template);

      t.title = template.title;
      t.shortDescription = template.shortDescription;
      t.longDescription = template.longDescription;
      t.category = template.category.id;
      console.log("getting category to id="+ this.itemFormGroup.get('category').value);
      console.log("setting category to id="+t.category);

      t.basePrice = template.basePrice.getAmount();
      t.domesticShippingPrice = template.domesticShippingPrice.getAmount();
      t.internationalShippingPrice = template.internationalShippingPrice.getAmount();

      this.itemFormGroup.setValue(t);

      this.images = template.images.map(i => {
        return {
          dataId: i.ItemImageDatas[0].dataId,
          id: i.id
        }
      })
      // this.itemFormGroup.get('category').setValue(t.category, {emitEvent: true});
    });
  }

// template add 1 "title" "short" "long" 80 "SALE" "PARTICL" 5 5 5 "Pasdfdfd"
  save(): Promise<any> {

    const item = this.itemFormGroup.value;
    let nPicturesAdded = 0;

    return new Promise((resolve, reject) => {
      this.template.add(
        item.title,
        item.shortDescription,
        item.longDescription,
        item.category,
        'SALE',
        'PARTICL',
        +item.basePrice,
        +item.domesticShippingPrice,
        +item.internationalShippingPrice
      ).take(1).subscribe(template => {
        this.templateId = template.id;
        this.log.d('Saved template', template);
        this.picturesToUpload.map(picture => {
          this.log.d('Uploading pictures!');
          this.template.addPicture(template.id, picture).take(1).subscribe(res => {
            console.log(res);
            if (++nPicturesAdded === this.picturesToUpload.length) {
              resolve(template.id);
            }
          });

        }); /* map pictures */
      }); /* template add */
    }); /* promise */
  }

  saveTemplate() {
    if (this.templateId) {
      // update 
    } else {
      this.save().then(id => {
        console.log('returning to sell');
        this.backToSell();
      });
    }

  }
  saveAndPublish() {
    this.log.d('saveAndPublish');
    if (this.templateId) {
      // update
    } else {
      // save new
      this.save().then(id => {
        this.template.post(id, 1).take(1).subscribe(listing => {
          console.log(listing);
          this.backToSell();
        });
      });
    }
  }

}
