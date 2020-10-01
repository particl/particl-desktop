import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil, tap, finalize } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../../management.service';
import { CreateMarketRequest } from '../../management.models';
import { MarketType } from '../../../shared/market.models';


function marketKeyValidator(): ValidatorFn {
  return (control: FormGroup): ValidationErrors | null => {
    const type = control.get('marketType');
    const keyPublish = control.get('marketType');
    return { 'marketkey': true };
  };
}


enum TextContent {
  ERROR_IMAGE_ADD = 'The image selected is not valid',
  MARKET_JOIN_SUCCESS = 'Successfully joined this market',
  MARKET_JOIN_ERROR = 'Failed to join the specified market'
}


@Component({
  templateUrl: './join-with-details-modal.component.html',
  styleUrls: ['./join-with-details-modal.component.scss']
})
export class JoinWithDetailsModalComponent implements OnInit, AfterViewInit, OnDestroy {


  isProcessing: boolean = false;
  marketTypeOptions: typeof MarketType = MarketType;
  optionsMarketRegions: {value: string; label: string}[];

  marketForm: FormGroup;

  readonly MAX_NAME: number;
  readonly MAX_SUMMARY: number;


  private destroy$: Subject<void> = new Subject();

  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _dialogRef: MatDialogRef<JoinWithDetailsModalComponent>,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService,
  ) {
    this.marketForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_NAME)]),
      summary: new FormControl('', [Validators.maxLength(this.MAX_SUMMARY)]),
      image: new FormControl(''),
      marketType: new FormControl('', [Validators.required]),
      region: new FormControl(''),
      keyReceive: new FormControl('', [Validators.required]), // TODO: implement validations
      keyPublish: new FormControl('')  // TODO: implement validations
    });

    this.optionsMarketRegions = this._manageService.getMarketRegions();
    this.MAX_NAME = this._manageService.MAX_MARKET_NAME;
    this.MAX_SUMMARY = this._manageService.MAX_MARKET_SUMMARY;
  }


  ngOnInit() {
    this.marketForm.get('marketType').valueChanges.pipe(
      tap(() => this.marketForm.get('keyPublish').setValue('')),
      takeUntil(this.destroy$)
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


  get formImageControl(): AbstractControl {
    return this.marketForm.get('image');
  }

  get formMarketTypeControl(): AbstractControl {
    return this.marketForm.get('marketType');
  }


  addImage(): void {
    this.fileInputSelector.nativeElement.click();
  }


  doAction(): void {
    if (!this.marketForm.valid || this.isProcessing) {
      return;
    }
    this.isProcessing = true;

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

    const recKey = this.marketForm.get('keyReceive').value;
    const pubKey = this.marketForm.get('keyPublish').value;

    createRequest.receiveKey = recKey;

    if (pubKey) {
      createRequest.publishKey = pubKey;

      if (pubKey === recKey) {
        createRequest.marketType = MarketType.MARKETPLACE;
      }

    } else {
      if (createRequest.marketType === MarketType.MARKETPLACE) {
        createRequest.publishKey = recKey;
      }
    }

    this._manageService.createMarket(createRequest).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (market) => {
        this._snackbar.open(TextContent.MARKET_JOIN_SUCCESS);
        this._dialogRef.close();
      },
      (err) => {
        this._snackbar.open(TextContent.MARKET_JOIN_ERROR, 'warn');
      }
    );
  }


  private processPictures(event: any, dnd: boolean = false): void {
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
    this.fileInputSelector.nativeElement.value = '';
  }


  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }

}
