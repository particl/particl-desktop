import { Component, OnInit, ComponentFactoryResolver, ViewChild, Type, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { defer, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { ImporterDirective } from './import.directive';
import { ImporterComponent } from './import-components/importer.component';
import { CsvImporterComponent } from './import-components/csv-importer/csv-importer.component';
// import { WooCommerceImporterComponent } from './import-components/woocommerce-importer/woocommerce-importer.component';
import { TemplateFormDetails } from '../sell.models';


interface ImportOption {
  title: string;
  icon: string;
  value: string;
  component: Type<ImporterComponent>;
}


@Component({
  templateUrl: './import-listings.component.html',
  styleUrls: ['./import-listings.component.scss']
})
export class ImportListingsComponent implements OnInit, OnDestroy {

  readonly importOptions: ImportOption[] = [
    { title: 'CSV file',    icon: 'part-image-upload',   value: 'csv', component: CsvImporterComponent},
    // { title: 'WooCommerce', icon: 'part-image-upload',   value: 'woocommerce', component: WooCommerceImporterComponent }
  ];

  @ViewChild(ImporterDirective, {static: false}) selectionContainer: ImporterDirective;

  selectedImportControl: FormControl = new FormControl(null);


  private destroy$: Subject<void> = new Subject();


  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {}


  ngOnInit() {

    this.selectedImportControl.valueChanges.pipe(
      switchMap((selectedValue) => this.loadSelectionView(selectedValue)),
      takeUntil(this.destroy$)
    ).subscribe();


    // if (this.importOptions.length === 1) {
    //   this.selectedImportControl.setValue(this.importOptions[0].value);
    // }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  setImportSauce(optionValue: string) {
    const foundOption = this.importOptions.find(opt => opt.value === optionValue);
    if (foundOption) {
      this.selectedImportControl.setValue(optionValue);
    }
  }


  private loadSelectionView(value: string): Observable<any> {
    return defer(() => {
      const importOption = this.importOptions.find(opt => opt.value === value);

      if (!importOption) {
        return;
      }

      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(importOption.component);

      const viewContainerRef = this.selectionContainer.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent<ImporterComponent>(componentFactory);
      componentRef.instance.importSuccess.subscribe(
        (results: TemplateFormDetails[]) => {
          // TODO: Create relevant template form items here and advance the stepper
        },
      );
    });
  }

}
