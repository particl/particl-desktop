import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SnackbarService } from 'app/core/core.module';
import { Category } from 'app/core/market/api/category/category.model';
import { CategoryService } from 'app/core/market/api/category/category.service';
import { MarketImportService } from 'app/core/market/market-import/market-import.service';

@Component({
  selector: 'app-import-listing',
  templateUrl: './import-listing.component.html',
  styleUrls: ['./import-listing.component.scss']
})
export class ImportListingComponent implements OnInit {

  @Input() listing: any;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  _rootCategoryList: Category = new Category({});
  dropArea: any;
  fileInput: any;

  constructor(
    private category: CategoryService,
    private _marketImportService: MarketImportService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.subToCategories();
  }

  async editItem(listing: any, editing: boolean) {
    listing['editing'] = editing;

    if (editing) {
      setTimeout(() => {
        // Initialize drag-n-drop
        this.initDragDropEl('drag-n-drop');
        this.fileInput = document.getElementById('fileInput');
        this.fileInput.onchange = this.processPictures.bind(this);
      }, 250);
    } else {
      this._marketImportService.validateListings([listing]).subscribe(
        (data) => {
          if(data.result) {
            listing['validationError'] = data.result[0].validationError;
            this.onChange.emit(true);
          }
        }
      )
    }
  }

  removeImage(index: number) {
    this.listing.images.splice(index, 1);
  }

  uploadPicture() {
    this.fileInput.click();
  }

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
                this.listing.images.push(<string>dataReader.result);
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

  onCategoryChange(category: Category): void {
    this.listing.category = category ? { id: category.id, name: category.name } : undefined;
  }

  publishChanged($event) {
    this.onChange.emit($event);
  }

  private subToCategories() {
    this.category.list()
      .subscribe(list => this.updateCategories(list));
  }

  private updateCategories(list: Category) {
    this._rootCategoryList = list;
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

  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
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
}
