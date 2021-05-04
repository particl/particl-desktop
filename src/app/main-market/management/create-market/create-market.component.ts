import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subject, merge, iif, defer} from 'rxjs';
import { takeUntil, tap, finalize, concatMap } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../management.service';
import { MarketTypeValidator } from './create-market.validators';
import { MarketType } from '../../shared/market.models';
import { DefaultMarketConfig } from '../../store/market.models';
import { CreateMarketRequest } from '../management.models';


enum TextContent {
  ERROR_IMAGE_ADD = 'The image selected was not valid',
  ERROR_MARKET_ADD = 'Error while attempting to add the market',
  SUCCESS_MARKET_ADD = 'Successfully added the market',
  LABEL_TYPE_MARKETPLACE = 'Marketplace',
  LABEL_TYPE_STOREFRONT = 'Storefront',
  PROCESSING_ADD_MARKET = 'Busy creating your market'
}


@Component({
  templateUrl: './create-market.component.html',
  styleUrls: ['./create-market.component.scss']
})
export class CreateMarketComponent implements OnInit, AfterViewInit, OnDestroy {

  @Select(MarketState.defaultConfig) marketConfig: Observable<DefaultMarketConfig>;
  marketTypeOptions: typeof MarketType = MarketType;
  optionsMarketRegions: {value: string; label: string}[];

  labelRegion: string = '';
  labelType: string = '';

  marketForm: FormGroup;

  readonly MAX_NAME: number;
  readonly MAX_SUMMARY: number;
  readonly imageSizeLabel: string;

  private destroy$: Subject<void> = new Subject();
  private readonly MAX_IMAGE_SIZE: number;

  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbar: SnackbarService,
    private _manageService: MarketManagementService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService,
  ) {

    this.optionsMarketRegions = this._manageService.getMarketRegions();
    this.MAX_NAME = this._manageService.MAX_MARKET_NAME;
    this.MAX_SUMMARY = this._manageService.MAX_MARKET_SUMMARY;
    this.MAX_IMAGE_SIZE = this._manageService.IMAGE_MAX_SIZE;
    this.imageSizeLabel = `${Math.round(Math.fround(this.MAX_IMAGE_SIZE / 1024))} KB`;

    this.marketForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_NAME)]),
      summary: new FormControl('', [Validators.maxLength(this.MAX_SUMMARY)]),
      image: new FormControl(''),
      marketType: new FormControl('', [Validators.required, MarketTypeValidator()]),
      region: new FormControl('')
    });

    const foundRegion = this.optionsMarketRegions.find(mr => mr.value === this.marketForm.get('region').value);
    if (foundRegion) {
      this.labelRegion = foundRegion.label;
    }
  }


  ngOnInit() {
    merge(
      this.marketForm.get('region').valueChanges.pipe(
        tap(value => {
          const foundRegion = this.optionsMarketRegions.find(mr => mr.value === value);
          if (foundRegion) {
            this.labelRegion = foundRegion.label;
          }
        }),
        takeUntil(this.destroy$)
      ),
      this.marketForm.get('marketType').valueChanges.pipe(
        tap(value => {
          switch (value) {
            case MarketType.MARKETPLACE: this.labelType = TextContent.LABEL_TYPE_MARKETPLACE; break;
            case MarketType.STOREFRONT_ADMIN: this.labelType = TextContent.LABEL_TYPE_STOREFRONT; break;
            default: this.labelType = '';
          }
        }),
        takeUntil(this.destroy$)
      )
    ).subscribe();
  }


  ngAfterViewInit() {
    const fileInput = this.fileInputSelector.nativeElement;
    const dropArea = this.dropArea.nativeElement;
    dropArea.ondragover = () => false;
    dropArea.ondragleave = () => false;
    dropArea.ondragend = () => false;

    dropArea.ondrop = (e: any) => {
      e.preventDefault();
      this.processPictures(e, true);
      return false;
    };
    fileInput.onchange = this.processPictures.bind(this);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  addImage() {
    this.fileInputSelector.nativeElement.click();
    // Need to re-bind here since the native element is removed from the DOM once an image has been added, and the
    //  newly inserted button element doesn't have the onchange event set.
    this.fileInputSelector.nativeElement.onchange = this.processPictures.bind(this);
  }


  get formImageControl(): AbstractControl {
    return this.marketForm.get('image');
  }


  actionCreateMarket(): void {
    if (!this.marketForm.valid) {
      return;
    }

    this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.PROCESSING_ADD_MARKET}});

    const createRequest: CreateMarketRequest = {
      name: this.marketForm.get('name').value,
      marketType: this.marketForm.get('marketType').value
    };

    const descReq = this.marketForm.get('summary').value;
    if (descReq.length) {
      createRequest.description = descReq;
    }

    const regionReq = this.marketForm.get('region').value;
    if (regionReq.length) {
      createRequest.region = regionReq;
    }

    const imageReq = this.marketForm.get('image').value;
    if (imageReq.length) {
      createRequest.image = {
        data: imageReq,
        type: 'REQUEST'
      };
    }

    this._unlocker.unlock({timeout: 20}).pipe(
      concatMap((unlocked) => iif(
        () => unlocked,
        defer(() => this._manageService.createMarket(createRequest))
      )),
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      (market) => {
        this._snackbar.open(TextContent.SUCCESS_MARKET_ADD);
        const queryParams: Params = {};
        if (market.marketType === MarketType.STOREFRONT_ADMIN) {
           queryParams.openCategoryModalFor = market.id;
        }
        this._router.navigate(['../'], {relativeTo: this._route, queryParams});
      },
      (err) => {
        this._snackbar.open(TextContent.ERROR_MARKET_ADD, 'warn');
      }
    );
  }


  private processPictures(event: any, dnd: boolean = false) {
    let sourceFiles: File[] = [];
    if (dnd) {
      for (const f of event.dataTransfer.files) {
        sourceFiles.push(f as File);
      }
    } else {
      sourceFiles = Array.from(event.target.files);
    }

    let failedImgs = false;
    sourceFiles.forEach((file: File) => {
      if (file.size > this.MAX_IMAGE_SIZE) {
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
            });
            const hex = bytes.join('').toUpperCase();
            if (this.isSupportedImageType(hex)) {
              const dataReader = new FileReader();

              dataReader.onload = _ev => {
                this.marketForm.get('image').setValue(<string>dataReader.result);
              };
              dataReader.readAsDataURL(file);
            } else {
              this._snackbar.open(TextContent.ERROR_IMAGE_ADD, 'warn');
            }
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
    if (failedImgs) {
      this._snackbar.open(TextContent.ERROR_IMAGE_ADD, 'warn');
    }
    if ((this.fileInputSelector !== undefined) && (this.fileInputSelector.nativeElement !== undefined)) {
      this.fileInputSelector.nativeElement.value = '';
    }
  }


  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }

}
