import { Component, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ImporterComponent } from '../importer.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { of, defer, Subject, iif } from 'rxjs';
import { exhaustMap, takeUntil, finalize, map, take, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from './../../../../store/market.state';

import { IpcService } from 'app/core/services/ipc.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { RegionListService } from '../../../../services/region-list/region-list.service';
import { SellService } from '../../../sell.service';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { isBasicObjectType, getValueOrDefault } from '../../../../shared/utils';
import { TemplateFormDetails } from '../../../sell.models';


interface CsvImportOptions {
  separator?: string;
  quote?: string;
  encoding?: 'win1252' | 'utf8';
  headers?: string[];
  getFromUrlFields?: {fieldName: string, fieldType: 'IMAGE'}[];
}


enum TextContent {
  CSV_IMPORT_ERROR = 'An error occurred during csv file parsing',
  CSV_PARSED_NO_RESULTS = 'No product rows found',
  CSV_EXAMPLE_EXPORTED_SUCCESS = 'Successfully copied example file',
  CSV_EXAMPLE_EXPORTED_ERROR = 'Error copying example file',
  IMPORT_WAIT_MSG = 'Processing your import file',
  IMPORT_WAIT_HELP = 'This may take some time if there are a large number of images to import from the internet',
}


@Component({
  templateUrl: './csv-importer.component.html',
  styleUrls: ['./csv-importer.component.scss']
})
export class CsvImporterComponent implements ImporterComponent, AfterViewInit, OnDestroy {

  importSuccess: EventEmitter<TemplateFormDetails[]> = new EventEmitter();

  readonly CSV_FIELDS: {field: string; mappedTo: string; description: string}[] = [
    {field: 'product_code', mappedTo: 'productCode', description: '(optional) Seller defined product code for this particular item'},
    {field: 'title', mappedTo: 'title', description: 'Product\'s title (Listing name)'},
    {field: 'summary', mappedTo: 'summary', description: 'short sentence highlighting Product\'s key features'},
    {field: 'description', mappedTo: 'description', description: 'general description of the Product'},
    {field: 'item_price', mappedTo: 'priceBase', description: 'price per Product (priced in PART)'},
    {field: 'domestic_shipping_price', mappedTo: 'priceShipLocal', description: 'price (in PART) for shipping the Product inside your country (specified later)'},
    {field: 'international_shipping_price', mappedTo: 'priceShipIntl', description: 'price for shipping the Product worldwide (outside your country)'},
    {field: 'escrow_buyer_ratio', mappedTo: 'escrowPercentageBuyer', description: 'Percentage of the total amount for an order that the buyer is required to put into (refundable) escrow; default is: 100'},
    {field: 'escrow_seller_ratio', mappedTo: 'escrowPercentageSeller', description: 'Percentage of the total amount for an order request that you, the seller, is required to put into (refundable) escrow when processing the order; default is: 100'},
    {field: 'source_country', mappedTo: 'shippingOrigin', description: 'the ISO3166 (alpha-2) 2 letter country code where the product is to be shipped from'},
    {field: 'destination_countries', mappedTo: 'shippingDestinations',
      description: '(optional) A comma-separated list of the ISO3166 (alpha-2) 2 letter country codes where the product can be purchased from (where the product can be shipped to).'
    },
    {
      field: 'images', mappedTo: 'pendingImages',
      description: '(optional) A comma separated list of URL\'s where the image(s) for this product are found (should be the full path if the image is located on the current machine, or the full url if located on the web). NOTE: only JPEG and PNG formats currently supported'
    },
  ];

  csvInputForm: FormGroup;
  isProcessing: boolean = false;


  private destroy$: Subject<void> = new Subject();
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _ipc: IpcService,
    private _snackbar: SnackbarService,
    private _regionService: RegionListService,
    private _sellService: SellService,
    private _dialog: MatDialog,
    private _store: Store
  ) {
    this.csvInputForm = new FormGroup({
      source: new FormControl('', [Validators.required]),
      quote: new FormControl('"', [Validators.required]),
      separator: new FormControl(',', [Validators.required]),
      sourceEncoding: new FormControl('utf8', [Validators.required]),
    });
  }


  ngAfterViewInit() {
    this.fileInputSelector.nativeElement.onchange = this.setSelectedFile.bind(this);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionCopyExample() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    const options = {
      modalType: 'SaveDialog',
      modalOptions: {
        title: 'Save example csv import file',
        defaultPath : 'import_template.csv',
        buttonLabel : 'Save',

        properties: ['createDirectory', 'showOverwriteConfirmation'],

        filters : [
          {name: 'csv', extensions: ['csv', ]},
          {name: 'All Files', extensions: ['*']}
        ]
      }
    };

    this._ipc.runCommand('open-system-dialog', null, options).pipe(
      finalize(() => this.isProcessing = false),
      take(1),
      concatMap(path => iif(
        () => (typeof path === 'string') && (path.length > 0),
        defer(() => this._ipc.runCommand('market-export-example-csv', null, path))
      ))
    ).subscribe(
      () => this._snackbar.open(TextContent.CSV_EXAMPLE_EXPORTED_SUCCESS),
      () => this._snackbar.open(TextContent.CSV_EXAMPLE_EXPORTED_ERROR)
    );
  }


  processFile() {
    if (this.isProcessing || this.csvInputForm.invalid) {
      return;
    }

    of({}).pipe(
      exhaustMap(() => defer(() => {
        this.isProcessing = true;
        this.csvInputForm.disable();
        const loaderDialog = this._dialog.open(ProcessingModalComponent, {
          disableClose: true,
          data: { message: TextContent.IMPORT_WAIT_MSG, helptext: TextContent.IMPORT_WAIT_HELP },
        });

        // const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
        // const marketSettings = this._store.selectSnapshot(MarketState.settings);
        // const MAX_IMAGE_FILESIZE = marketSettings.usePaidMsgForImages ? defaultConfig.imageMaxSizePaid : defaultConfig.imageMaxSizeFree;

        const values = this.csvInputForm.value;

        const options: CsvImportOptions = {
          quote: values.quote,
          separator: values.separator,
          headers: this.CSV_FIELDS.map(f => f.field),
          getFromUrlFields: [ {fieldName: 'images', fieldType: 'IMAGE'}],
        };

        return this._ipc.runCommand(
          'market-importer',
          null,
          'csv',
          values.source,
          options
        ).pipe(
          finalize(() => {
            this.isProcessing = false;
            this.csvInputForm.enable();
            loaderDialog.close();
          }),
          map(results => {
            const details: TemplateFormDetails[]  = [];

            if (!Array.isArray(results)) {
              return details;
            }

            const allCountriesList = this._regionService.getCountryList();
            const getCountryISO = (codeOrCountry: string): string => {
              const country = allCountriesList.find(c => (c.iso === codeOrCountry) || (c.name === codeOrCountry));
              if (country) {
                return country.iso;
              }
              return '';
            };

            results.forEach(res => {

              if (isBasicObjectType(res)) {
                const detail: TemplateFormDetails = {
                  title: '',
                  summary: '',
                  description: '',
                  productCode: '',
                  priceBase: '',
                  priceShipLocal: '',
                  priceShipIntl: '',
                  escrowPercentageBuyer: this._sellService.ESCROW_PERCENTAGE_DEFAULT,
                  escrowPercentageSeller: this._sellService.ESCROW_PERCENTAGE_DEFAULT,
                  shippingOrigin: '',
                  shippingDestinations: [] as string[],
                  savedImages: [],
                  pendingImages: [],
                  market: { selectedMarketId: 0, canEdit: true },
                  category: { selectedMarketCategoryId: 0, canEdit: true },
                };

                this.CSV_FIELDS.forEach(f => {
                  if (f.mappedTo.length > 0) {

                    switch (Object.prototype.toString.call(detail[f.mappedTo])) {
                      case '[object String]':
                        detail[f.mappedTo] = getValueOrDefault(res[f.field], 'string', detail[f.mappedTo]).trim();
                        break;

                      case '[object Array]':
                        if (typeof res[f.field] === 'string') {
                          // value comes back as a string, so split and trim each item and then assign
                          detail[f.mappedTo] = (<string>getValueOrDefault(res[f.field], 'string', ''))
                            .split(',')
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                        } else if (Array.isArray(res[f.field])) {
                          detail[f.mappedTo] = res[f.field];
                        }
                        break;

                      case '[object Number]':
                        detail[f.mappedTo] = Number.isSafeInteger(+res[f.field]) ? +res[f.field] : detail[f.mappedTo];
                        break;
                    }
                  }
                });

                if (detail.shippingOrigin) {
                  detail.shippingOrigin = getCountryISO(detail.shippingOrigin);
                }
                if (detail.shippingDestinations) {
                  detail.shippingDestinations.map(s => getCountryISO(s.trim())).filter(s => s.length > 0);
                }

                details.push(detail);
              }

            });

            return details;
          }),
          takeUntil(this.destroy$)
        );
      }))
    ).subscribe(
      (results) => {
        if (!Array.isArray(results) || (results.length === 0)) {
          this._snackbar.open(TextContent.CSV_PARSED_NO_RESULTS, 'warn');
          return;
        }
        this.importSuccess.emit(results);
      },
      (err) => {
        this._snackbar.open(TextContent.CSV_IMPORT_ERROR, 'warn');
      }
    );
  }


  private setSelectedFile(event: any): void {
    const sourceFiles = Array.from(event.target.files as FileList);

    const sourceFile: any = sourceFiles.shift();
    if (sourceFile && (typeof sourceFile.path === 'string')) {
      this.csvInputForm.get('source').setValue(sourceFile.path);
    } else {
      this.csvInputForm.get('source').setValue('');
    }
  }

}
