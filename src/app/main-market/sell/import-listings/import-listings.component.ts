import { Component, OnInit, ComponentFactoryResolver, ViewChild, Type, OnDestroy, ComponentRef, ViewContainerRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatStepper, MatDialog } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { defer, Observable, Subject, of, merge, concat } from 'rxjs';
import { switchMap, takeUntil, map, tap, catchError, finalize } from 'rxjs/operators';

import { RegionListService } from 'app/main-market/services/region-list/region-list.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ImportTemplateItemComponent } from './import-components/import-template-item/imported-template-item.component';
import { ImporterDirective } from './import.directive';
import { ImporterComponent } from './import-components/importer.component';
import { CsvImporterComponent } from './import-components/csv-importer/csv-importer.component';
// import { WooCommerceImporterComponent } from './import-components/woocommerce-importer/woocommerce-importer.component';
import { TemplateFormDetails } from '../sell.models';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';


interface ImportOption {
  title: string;
  icon: string;
  value: string;
  component: Type<ImporterComponent>;
}


enum TextContent {
  PROCESSING_TEMPLATE_IMPORT = 'Importing and saving the selected templates',
  SUCCESSFUL_IMPORT = 'Successfully imported all selected products'
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

  selectedImportControl: FormControl = new FormControl(null);
  isRenderingTemplates: boolean = false;
  isBusy: boolean = false;
  countItemsParsed: number = 0;
  countSelectedForImport: number = 0;
  hasProcessError: boolean = false;

  private destroy$: Subject<void> = new Subject();
  private counter$: Subject<void> = new Subject();
  private importComponentRef: ComponentRef<ImporterComponent>;
  private productTemplateComponents: ComponentRef<ImportTemplateItemComponent>[] = [];
  private readonly regions$: Observable<{id: string, name: string}[]>;

  @ViewChild(ImporterDirective, {static: false}) private uiSelectionContainer: ImporterDirective;
  @ViewChild('stepper', {static: false}) private uiStepper: MatStepper;
  @ViewChild('productTemplateList', {static: false, read: ViewContainerRef}) private uiProductContainer: ViewContainerRef;


  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _regionService: RegionListService
  ) {
    const regionsMap = this._regionService.getCountryList().map(c => ({id: c.iso, name: c.name}));
    this.regions$ = of(regionsMap);
  }


  ngOnInit() {

    this.selectedImportControl.valueChanges.pipe(
      switchMap((selectedValue) => this.loadSelectionView(selectedValue)),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.counter$.next();
    this.counter$.complete();
    this.destroyProductComponents();

    this.destroy$.next();
    this.destroy$.complete();

    if (this.importComponentRef) {
      this.importComponentRef.destroy();
    }
  }


  get canProcessProducts(): boolean {
    return (this.productTemplateComponents.length > 0) && (this.countSelectedForImport < this.productTemplateComponents.length);
  }


  stepperChangedSelection(ev: StepperSelectionEvent): void {
    if (ev.previouslySelectedIndex === 1) {
      this.destroyProductComponents();
    }
  }


  setImportSauce(optionValue: string): void {
    const foundOption = this.importOptions.find(opt => opt.value === optionValue);
    if (foundOption) {
      this.selectedImportControl.setValue(optionValue);
    }
  }


  processImports() {
    if (!this.canProcessProducts || this.isBusy) {
      return;
    }

    this.isBusy = true;

    this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: { message: TextContent.PROCESSING_TEMPLATE_IMPORT }
    });

    const processing = [];
    let allSuccessful = true;
    for (const comp of this.productTemplateComponents) {
      processing.push(
        comp.instance.getTemplateCreationObservable().pipe(
          catchError(() => of(false)),
          tap(isSuccess => {
            if (!isSuccess && allSuccessful) {
              allSuccessful = false;
            }
          })
        )
      );
    }

    concat(...processing).pipe(
      finalize(() => {
        this.isBusy = false;
        this._dialog.closeAll();
        if (allSuccessful) {
          this._snackbar.open(TextContent.SUCCESSFUL_IMPORT);
          this._router.navigate(['../'], {relativeTo: this._route, queryParams: {selectedSellTab: 'templates'}});
        } else {
          this.hasProcessError = true;
          this.countSelectedForImport = this.productTemplateComponents.length;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();

  }


  private loadSelectionView(value: string): Observable<any> {
    return defer(() => {
      const importOption = this.importOptions.find(opt => opt.value === value);

      if (!importOption) {
        return;
      }

      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(importOption.component);

      const viewContainerRef = this.uiSelectionContainer.viewContainerRef;
      viewContainerRef.clear();

      this.importComponentRef = viewContainerRef.createComponent<ImporterComponent>(componentFactory);
      this.importComponentRef.instance.importSuccess.subscribe(
        (results: TemplateFormDetails[]) => {
          if (Array.isArray(results) && (results.length > 0) && !this.destroy$.isStopped) {
            this.uiStepper.steps.first.completed = true;
            this.uiStepper.next();
            this.renderTemplateDetailItems(results);
          }
        },
      );
    });
  }


  private renderTemplateDetailItems(results: TemplateFormDetails[]) {
    this.destroyProductComponents();
    this.isRenderingTemplates = true;
    this.countItemsParsed = results.length;

    const listeners$ = [];

    for (const result of results) {
      const componentFactory = this._componentFactoryResolver.resolveComponentFactory(ImportTemplateItemComponent);
      const component = this.uiProductContainer.createComponent(componentFactory);
      component.instance.template = result;
      component.instance.regions$ = this.regions$;
      listeners$.push(
        component.instance.onValidityChange.pipe(map(isSelected => (isSelected ? -1 : 1)))
      );
      this.productTemplateComponents.push(component);
    }

    merge(...listeners$).pipe(
      takeUntil(this.counter$)
    ).subscribe(
      (val: number) => {
        this.countSelectedForImport += val;
        if (this.hasProcessError) {
          this.hasProcessError = false;
        }
      }
    );

    this.isRenderingTemplates = false;
  }


  private destroyProductComponents(): void {
    this.counter$.next();
    this.countSelectedForImport = 0;
    this.productTemplateComponents.forEach(ptc => {
      try {
        ptc.destroy();
      } catch (er) {

      }
    });
    this.uiProductContainer.clear();
    this.productTemplateComponents = [];
  }

}
