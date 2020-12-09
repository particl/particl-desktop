import { Component, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ImporterComponent } from '../importer.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { of, defer, Subject, iif } from 'rxjs';
import { exhaustMap, takeUntil, finalize, map, take, concatMap } from 'rxjs/operators';

import { IpcService } from 'app/core/services/ipc.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { isBasicObjectType, getValueOrDefault } from 'app/main-market/shared/utils';
import { TemplateFormDetails } from 'app/main-market/sell/sell.models';


interface CsvImportOptions {
  separator?: string;
  quote?: string;
  encoding?: 'win1252' | 'utf8';
  headers?: string[];
}


enum TextContent {
  CSV_IMPORT_ERROR = 'An error occurred during csv file parsing',
  CSV_PARSED_NO_RESULTS = 'No product rows found',
  CSV_EXAMPLE_EXPORTED_SUCCESS = 'Successfully copied example file',
  CSV_EXAMPLE_EXPORTED_ERROR = 'Error copying example file'
}


@Component({
  templateUrl: './csv-importer.component.html',
  styleUrls: ['./csv-importer.component.scss']
})
export class CsvImporterComponent implements ImporterComponent, AfterViewInit, OnDestroy {

  importSuccess: EventEmitter<TemplateFormDetails[]> = new EventEmitter();

  readonly CSV_FIELDS: {field: string; mappedTo: string; description: string}[] = [
    {field: 'title', mappedTo: 'title', description: 'Product\'s title (Listing name)'},
    {field: 'summary', mappedTo: 'summary', description: 'short sentence highlighting Product\'s key features'},
    {field: 'description', mappedTo: 'description', description: 'general description of the Product'},
    {field: 'item_price', mappedTo: 'priceBase', description: 'price per Product (priced in PART)'},
    {field: 'domestic_shipping_price', mappedTo: 'priceShipLocal', description: 'price (in PART) for shipping the Product inside your country (specified later)'},
    {field: 'international_shipping_price', mappedTo: 'priceShipIntl', description: 'price for shipping the Product worldwide (outside your country)'},
    {field: 'source_country', mappedTo: 'shippingOrigin', description: 'the ISO3166 (alpha-2) 2 letter country code where the product is to be shipped from'},
  ];

  csvInputForm: FormGroup;
  isProcessing: boolean = false;


  private destroy$: Subject<void> = new Subject();
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _ipc: IpcService,
    private _snackbar: SnackbarService
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
        const values = this.csvInputForm.value;

        const options: CsvImportOptions = {
          quote: values.quote,
          separator: values.separator,
          headers: this.CSV_FIELDS.map(f => f.field)
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
          }),
          map(results => {
            const details: TemplateFormDetails[]  = [];

            if (!Array.isArray(results)) {
              return details;
            }

            results.forEach(res => {

              if (isBasicObjectType(res)) {
                const detail: TemplateFormDetails = {
                  title: '',
                  summary: '',
                  description: '',
                  priceBase: '',
                  priceShipLocal: '',
                  priceShipIntl: '',
                  shippingOrigin: '',
                  shippingDestinations: [] as string[],
                  savedImages: [],
                  market: { selectedMarketId: 0, canEdit: true },
                  category: { selectedMarketCategoryId: 0, canEdit: true },
                };

                this.CSV_FIELDS.forEach(f => {
                  if (f.mappedTo.length > 0) {
                    detail[f.mappedTo] = getValueOrDefault(res[f.field], 'string', detail[f.mappedTo]);
                  }
                });

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
      (err) => this._snackbar.open(TextContent.CSV_IMPORT_ERROR, 'warn')
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
