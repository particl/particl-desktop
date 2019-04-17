import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { Category } from 'app/core/market/api/category/category.model';
import { Amount } from '../../../core/util/utils';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Template } from 'app/core/market/api/template/template.model';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { ImageService } from 'app/core/market/api/template/image/image.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { InformationService } from 'app/core/market/api/template/information/information.service';
import { LocationService } from 'app/core/market/api/template/location/location.service';
import { EscrowService, EscrowType } from 'app/core/market/api/template/escrow/escrow.service';
import { Image } from 'app/core/market/api/template/image/image.model';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { PaymentService } from 'app/core/market/api/template/payment/payment.service';
import { take } from 'rxjs/operators';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { MatDialog } from '@angular/material';


class CurrencyMinValidator {
  static validValue(fc: FormControl) {
    const amount: number = +fc.value;
    if ( amount >= 0 ) {
      if ( (fc.value.length > +amount.toFixed(8).length) || (amount > 1e06) ) {
        return ({ validAmount: false });
      }
      return (null);
    }
    return ({ validAmount: false });
  }
}


@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit, OnDestroy {

  log: any = Log.create('add-item.component');
  private destroyed: boolean = false;
  // template id
  templateId: number;
  preloadedTemplate: Template;
  itemFormGroup: FormGroup;

  _rootCategoryList: Category = new Category({});
  images: Image[];

  // file upload
  dropArea: any;
  fileInput: any;
  picturesToUpload: string[];
  featuredPicture: number = 0;
  selectedCountry: Country;
  selectedCategory: Category;
  canPublish: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private category: CategoryService,
    private template: TemplateService,
    private image: ImageService,
    private information: InformationService,
    private location: LocationService,
    private listing: ListingService,
    private snackbar: SnackbarService,
    private rpcState: RpcStateService,

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    private modals: ModalsHelperService,
    public countryList: CountryListService,
    private escrow: EscrowService,
    private payment: PaymentService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.picturesToUpload = new Array();

    this.subToCategories();

    this.itemFormGroup = this.formBuilder.group({
      title:                      ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      shortDescription:           ['', [Validators.required,
                                        Validators.maxLength(200)]],
      longDescription:            ['', [Validators.required,
                                        Validators.maxLength(1000)]],
      category:                   ['', [Validators.required]],
      country:                    ['', [Validators.required]],
      basePrice:                  ['', [Validators.required, Validators.minLength(1), CurrencyMinValidator.validValue]],
      domesticShippingPrice:      ['', [Validators.required, Validators.minLength(1), CurrencyMinValidator.validValue]],
      internationalShippingPrice: ['', [Validators.required, Validators.minLength(1), CurrencyMinValidator.validValue]]
    });

    this.route.queryParams.pipe(take(1)).subscribe(params => {
      // Initialize drag-n-drop
      this.initDragDropEl('drag-n-drop');
      this.fileInput = document.getElementById('fileInput');
      this.fileInput.onchange = this.processPictures.bind(this);

      const id = params['id'];

      // Determine whether template is a clone or not
      const clone: boolean = params['clone'];
      if (+id) {
        this.templateId = +id;
        this.preload(clone);
      } else {
        this.canPublish = true;
      }
    });
  }

  isExistingTemplate() {
    return this.preloadedTemplate || +this.templateId > 0;
  }

  uploadPicture() {
    this.fileInput.click();
  }

  // @TODO : remove type any
  processPictures(event: any, dnd: boolean = false) {
    let sourceFiles: File[] = [];
    if (dnd) {
      for (const f of event.dataTransfer.files) {
        sourceFiles.push(f as File);
      }
    } else {
      sourceFiles = Array.from(event.target.files);
    }

    const MAX_IMAGE_SIZE = 1024 * 1024 * 2; // (2MB)
    let failedImgs = false;
    sourceFiles.forEach((file: File) => {
      if (file.size > MAX_IMAGE_SIZE) {
        failedImgs = true;
      } else {
        const reader = new FileReader();
        reader.onloadend = (_event) => {
          if (reader.readyState === 2) {
            const res = <ArrayBuffer>reader.result;
            const uint = new Uint8Array(res, 0, 4);
            const bytes = [];
            uint.forEach(byte => {
              bytes.push(byte.toString(16));
            })
            const hex = bytes.join('').toUpperCase();
            // TODO: add error message once all images processed indicating that 1 or more failed
            //  Not added here, because this is is eventing on multiple objects
            //  (using counters requires locks to ensure atomic counter updates)
            if (this.isSupportedImageType(hex)) {
              const dataReader = new FileReader();

              dataReader.onload = _ev => {
                this.picturesToUpload.push(<string>dataReader.result);
                this.log.d('added picture', file.name);
              }
              dataReader.readAsDataURL(file);
            }
          }
        }
        reader.readAsArrayBuffer(file);
      }
    });
    if (failedImgs) {
      this.snackbar.open('1 or more images failed: max image size is 2MB');
    }
    this.fileInput.value = '';
  }

  removeExistingImage(image: Image) {
    this.image.remove(image.id).subscribe(
      async (success) => {
        // find image in array and remove it.
        const indexToRemove: number = this.images.findIndex((element: Image) => {
          return element.id === image.id
        });
        if (indexToRemove >= 0) {
          this.log.d('Removing existing image from UI with index', indexToRemove);
          this.images.splice(indexToRemove, 1);
        }
        this.canPublish = await this.templateHasValidSize().catch(err => {
          this.snackbar.open('Failed to recalculate template size');
          return this.canPublish;
        });
        this.snackbar.open('Removed image successfully!');
      },
      error => this.snackbar.open(error)
    );
  }

  removePicture(index: number) {
    this.picturesToUpload.splice(index, 1);
    if (this.featuredPicture > index) {
      this.featuredPicture -= 1;
    }
  }

  featurePicture(index: number) {
    this.featuredPicture = index;
  }

  private subToCategories() {
    this.category.list()
      .subscribe(list => this.updateCategories(list));
  }

  updateCategories(list: Category) {
    this.log.d('Updating category list');
    this._rootCategoryList = list;
  }

  backToSell() {
    this.dialog.closeAll()
    this.router.navigate(['/wallet/main/market/sell']);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  preload(isCloned: boolean) {
    this.log.d(`preloading for id=${this.templateId}`);
    this.template.get(this.templateId, true).subscribe(async (template: Template) => {
      this.log.d(`preloaded id=${this.templateId}!`);

      if (this.listing.cache.isAwaiting(template)) {
        template.status = 'awaiting';
      }

      const t = {
        title: '',
        shortDescription: '',
        longDescription: '',
        category: 0,
        basePrice: '0',
        domesticShippingPrice: '0',
        internationalShippingPrice: '0',
        country: ''
      };

      this.log.d('template', template);
      const country = this.countryList.getCountryByRegion(template.country);
      t.title = template.title;
      t.shortDescription = template.shortDescription;
      t.longDescription = template.longDescription;
      t.category = template.category.id;
      t.country = country ? country.name : '';

      // set default value as selected.
      this.setDefaultCountry(country);
      this.setDefaultCategory(template.category);

      t.basePrice = template.basePrice.getAmountAsString();
      t.domesticShippingPrice = template.domesticShippingPrice.getAmountAsString();
      t.internationalShippingPrice = template.internationalShippingPrice.getAmountAsString();
      this.itemFormGroup.patchValue(t);

      if (isCloned) {
        this.picturesToUpload = template.imageCollection.images.map(img => img.originalEncoding).filter(img => img.length);
        this.templateId = undefined;
        this.canPublish = true;
      } else {
        this.images = template.imageCollection.images;
        this.preloadedTemplate = template;
        this.canPublish = await this.templateHasValidSize().catch(err => {
          this.snackbar.open('Failed to recalculate template size');
          return this.canPublish;
        });
      }
    });
  }

  setDefaultCountry(country: Country) {
    this.selectedCountry = country;
  }

  setDefaultCategory(category: Category) {
    this.selectedCategory = category;
  }

  private async save(): Promise<Template> {

    const item = this.itemFormGroup.value;
    const country = this.countryList.getCountryByName(item.country);

    const template: any = await this.template.add(
      item.title,
      item.shortDescription,
      item.longDescription,
      item.category,
      'SALE',
      'PARTICL',
      +item.basePrice,
      +item.domesticShippingPrice,
      +item.internationalShippingPrice
    ).toPromise();

    this.preloadedTemplate = new Template(template);

    this.templateId = template.id;
    await this.location.execute('add', this.templateId, country, null, null).toPromise();
    await this.escrow.add(template.id, EscrowType.MAD).toPromise();
    await this.uploadImages();

    return this.template.get(template.id, false).toPromise();
  }

  private async update() {
    const item = this.itemFormGroup.value;
    // update information
    if (this.isTemplateInfoUpdated(item)) {
      await this.information.update(
        this.templateId,
        item.title,
        item.shortDescription,
        item.longDescription,
        item.category
      ).toPromise();
    }

    const country = this.countryList.getCountryByName(item.country);

    // update location
    if (this.preloadedTemplate.country !== country.iso) {

      await this.location.execute('update', this.templateId, country, null, null).toPromise();
    }

    // update escrow
    // @TODO EscrowType will change in future?
    await this.escrow.update(this.templateId, EscrowType.MAD).toPromise();

    // update shipping?
    // update messaging?

    if (this.isPaymentInfoUpdated(item)) {

      // update payment
      await this.payment.update(
        this.templateId,
        +item.basePrice,
        +item.domesticShippingPrice,
        +item.internationalShippingPrice
      ).toPromise();
    }

    // update images
    await this.uploadImages();

    return this.template.get(this.templateId, false).toPromise();
  }

  isPaymentInfoUpdated(item: any): boolean {
    return (
      this.preloadedTemplate.basePrice.getAmount() !== +item.basePrice ||
      this.preloadedTemplate.domesticShippingPrice.getAmount() !== +item.domesticShippingPrice ||
      this.preloadedTemplate.internationalShippingPrice.getAmount() !== +item.internationalShippingPrice
    )
  }

  isTemplateInfoUpdated(item: any): boolean {
    return (
      this.preloadedTemplate.title !== item.title ||
      this.preloadedTemplate.shortDescription !== item.shortDescription ||
      this.preloadedTemplate.longDescription !== item.longDescription ||
      this.category !== item.category
    );
  }

  validate() {
    return this.itemFormGroup.valid || this.snackbar.open('Invalid Listing');
  }

  numericValidator(event: any) {
    const pasted = String(event.clipboardData ? event.clipboardData.getData('text') : '' );
    const key = String(event.key || '');

    const value = `${pasted}${key}${String(event.target.value)}`;
    let valid = true;
    let sepFound = false;
    for (let ii = 0; ii < value.length; ii++) {
      if (value.charAt(ii) === '.') {
        if (sepFound) {
          valid = false;
          break;
        }
        sepFound = true;
        continue;
      }
      const charCode = value.charCodeAt(ii);
      if ( (charCode < 48) || (charCode > 57)) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      return false;
    }
  }

  public async upsert(): Promise<void> {
    if (!this.validate()) {
      return;
    };
    this.log.d('Processing template (upsert)');

    let resp: Promise<Template>;

    if (this.preloadedTemplate && this.preloadedTemplate.id) {
      this.log.d(`Updating existing template ${this.preloadedTemplate.id}`);
      resp = this.update();
    } else {
      this.log.d(`Creating new template`);
      resp = this.save();
    }

    return resp.then((templ) => {
      this.preloadedTemplate = templ;
      this.templateId = templ.id;
      this.images = templ.imageCollection.images;
    }).then(
      async () => {
        this.canPublish = await this.templateHasValidSize();
      }
    );
  }

  public saveTemplate() {
    if (this.preloadedTemplate && this.preloadedTemplate.status === 'published') {
      this.snackbar.open('You can not modify templates once they have been published!');
      return;
    }
    this.openProcessingModal();

    this.upsert()
    .then(() => {
      this.dialog.closeAll();
      this.snackbar.open('Succesfully updated template!')
    })
    .catch(err => {
      this.dialog.closeAll();
      this.snackbar.open('Failed to save template!')
    });
  }

  async saveAndPublish() {
    if (!this.validate()) {
      return;
    };

    this.log.d('Saving and publishing the listing.');
    // Oh look, what a mess ahead...
    // @TODO refactor this so that the modal unlock can occur in the openListingModal() target component,
    //    WITHOUT inducing circular dependencies.
    this.openProcessingModal();
    await this.upsert().then(
      () => {
        if (!this.canPublish) {
          throw new Error('Message upload size exceeded');
        }
      }
    ).then(
      () => {
        // Close the loading modal
        this.dialog.closeAll();
      }
    ).then(
      () => {
        this.modals.unlock({timeout: 30},
          (status) => {
            this.modals.openListingExpiryModal({template: this.preloadedTemplate}, (expiration: number) => {
              this.postTemplate(expiration);
            });
          },
          (err) => {
            this.dialog.closeAll();
          },
          false
        );
      }
    ).catch(err => {
      this.dialog.closeAll();
      this.snackbar.open(err);
    });

  }

  onCountryChange(country: Country): void {
    this.itemFormGroup.patchValue({ country: country ? country.name : '' })
  }


  onCategoryChange(category: Category): void {
    this.log.d('category', category);
    this.itemFormGroup.patchValue({ category: (category ? category.id : undefined) })
  }

  private async templateHasValidSize(): Promise<boolean> {
    return this.template.size(this.templateId).toPromise().then(
      (resp) => {
        return resp.fits;
      }
    );
  }



  private initDragDropEl(elementID: string) {
    this.dropArea = document.getElementById(elementID);
    if (!this.dropArea) {
      return;
    }
    this.dropArea.ondragover = () => false;
    this.dropArea.ondragleave = () => false;
    this.dropArea.ondragend = () => false;

    this.dropArea.ondrop = (e) => {
        e.preventDefault();

        this.processPictures(e, true);
        return false;
    };
  }


  private async uploadImages(): Promise<boolean> {
    let success = false;
    if (this.picturesToUpload.length && this.preloadedTemplate) {
      success = await this.image.upload(this.preloadedTemplate, this.picturesToUpload).then((t: Template) => {
        this.picturesToUpload = [];
        return true;
      }).catch(err => false);
    }
    return success;
  }

  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }

  private postTemplate(expiryDays: number) {
    this.modals.unlock({timeout: 30},
      (status) => {
        this.openProcessingModal();
        this.template.post(this.preloadedTemplate, 1, expiryDays)
          .subscribe(
            (listing) => {
              this.dialog.closeAll();
              this.snackbar.open('Succesfully added Listing!');
              this.log.d('Sucecssfully added listing: ', listing);
              this.backToSell();
            },
            (err) => {
              this.dialog.closeAll();
              this.snackbar.open(err);
            }
          );
      },
      (err) => {
        this.dialog.closeAll();
      }
    );
  }


  openProcessingModal() {
    const dialog = this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Hang on, we are busy processing your listing'
      }
    });
  }

}
