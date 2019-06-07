import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { isMainnetRelease, Amount } from 'app/core/util/utils';
import { MarketImportService } from 'app/core/market/market-import/market-import.service';

import * as _ from 'lodash';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { RpcService, RpcStateService } from 'app/core/core.module';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { MatDialog } from '@angular/material';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';
import { TemplateService } from 'app/core/market/api/template/template.service';

@Component({
  selector: 'app-import-listings',
  templateUrl: './import-listings.component.html',
  styleUrls: ['./import-listings.component.scss']
})
export class ImportListingsComponent implements OnInit, OnDestroy {

  // public selectedImport: any;
  public importError: string;
  public availableImports: any[] = [];
  public listings: any[] = [];
  public expiredList: Array<any> = [
    { title: '1 day', value: 1, estimateFee: new Amount(0), isDisabled: false },
    { title: '2 days', value: 2, estimateFee: new Amount(0), isDisabled: false },

    /**
     * @TODO remove the 1 day and 2 days options and enable to other options.
     * as corrently its gryed out for a while the commented code once smsg issue goes fixed.
     *
     */

    { title: '4 days', value: 4, estimateFee: new Amount(0), isDisabled: true },
    { title: '1 week', value: 7, estimateFee: new Amount(0), isDisabled: true },
    { title: '2 weeks', value: 14, estimateFee: new Amount(0), isDisabled: true },
    { title: '3 weeks', value: 21, estimateFee: new Amount(0), isDisabled: true },
    { title: '4 weeks', value: 28, estimateFee: new Amount(0), isDisabled: true }
  ];
  public selectedExpiration: number;
  public selectedCountry: Country;
  public currentestimateFee: Amount = null;
  public network: string = isMainnetRelease() ? 'mainnet' : 'testnet';

  public paramForm: FormGroup;

  get filterByNetwork() {
    return this.availableImports.filter( x => x.networks.indexOf(this.network) > -1);
  }

  get canPublish() {
    return (this.listings.length > 0 &&
            !_.find(this.listings, x => x.publish && x.validationError) &&
            _.find(this.listings, x => x.publish));
  }

  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _marketImportService: MarketImportService,
    private _modals: ModalsHelperService,
    private _dialog: MatDialog,
    private _template: TemplateService,
    private _listingCache: PostListingCacheService,
    public countryList: CountryListService
  ) {
    this._marketImportService.getImportConfig()
    .then((config: any) => {
      this.availableImports = config;

      for (const i of this.availableImports) {
        const group: any = {};

        i.params.forEach(question => {
          group[question.name] = question.mandatory ? new FormControl(question.default || '', Validators.required)
                                                    : new FormControl(question.default || '');
        });
        i['form'] = new FormGroup(group);
      }
    });
  }

  async importLoad(importDef: any) {
    const loadDialog = this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Hang on, we are busy loading your import'
      }
    });

    this.clearOldValues();

    importDef.params = importDef.params.map(param => {
      if (param.type === 'file') {
        param['value'] = importDef.form.value[param.name].files[0].path;
      } else {
        param['value'] = importDef.form.value[param.name];
      }

      return param;
    });

    const importParams = _.pick(importDef, ['id', 'params']);

    this._marketImportService.loadListingsFromImporter(importParams).subscribe(
      (loadData) => {
        if (loadData.status) {
          loadDialog.componentInstance.data.message = loadData.status;
        }
        if (loadData.result) {
          this._marketImportService.validateListings(loadData.result).subscribe(
            (data) => {
              if (data.status) {
                loadDialog.componentInstance.data.message = data.status;
              }

              if (data.result) {
                setTimeout(() => this.listings = data.result, 1);

                this._dialog.closeAll();
              }
            },
            (error) => {
              this.importError = error;
              this._dialog.closeAll();
            }
          )
        }
      },
      (error) => {
        this.importError = error;
        this._dialog.closeAll();
      }
    )
  }

  estimateFee() {
    const listingsToEstimate = this.listings.filter(l => l.publish).length;
    this._modals.unlock({timeout: listingsToEstimate * 20}, async (status) => {
      const estimateDialog = this._dialog.open(ProcessingModalComponent, {
        disableClose: true,
        data: {
          message: `Hang on, we are busy calculating the publishing fee for ${listingsToEstimate} listings`
        }
      });
      this._marketImportService.validateListings(this.listings, this.selectedCountry.iso, this.selectedExpiration).subscribe(
        (data) => {
          if (data.status) {
            estimateDialog.componentInstance.data.message = data.status;
          }
          if (data.result) {
            setTimeout(() => {
              this.listings = data.result;
              let fee = 0;
              for (const listing of this.listings) {
                if (listing.publish) {
                  fee += listing.fee;
                }
              }
              this.currentestimateFee = new Amount(fee);
              this._dialog.closeAll();
            }, 1);

            this._rpc.call('walletlock').toPromise().then(() => {
              this._rpcState.stateCall('getwalletinfo');
            });
          }
        },
        (error) => {
          this.importError = error;
          this._dialog.closeAll();
        }
      )
    });
  }

  publishListing() {
    const listingsToPublish = this.listings.filter(l => l.publish).length;
    this._modals.unlock({timeout: listingsToPublish * 30}, async (status) => {
      const publishingDialog = this._dialog.open(ProcessingModalComponent, {
        disableClose: true,
        data: {
          message: `Hang on, we are busy publishing ${listingsToPublish} listings`
        }
      });
      this._marketImportService.publishListings(this.listings, this.selectedCountry.iso, this.selectedExpiration).subscribe(
        (data) => {
          if (data.status) {
            publishingDialog.componentInstance.data.message = data.status;
          }
          if (data.result) {
            setTimeout(async() => {
              this.listings = data.result

              publishingDialog.componentInstance.data.message = 'Hang on, we are busy updating the lisitng cache';

              for (let index = this.listings.length - 1; index >= 0; index--) {
                const listing = this.listings[index];

                if (listing.id) {
                  const template = await this._template.get(listing.id, false).toPromise();
                  this._listingCache.posting(template);

                  this.listings.splice(index, 1);
                }
              }
              this._dialog.closeAll();
            }, 1);
          }
        },
        (error) => {
          this.importError = error;
          this._dialog.closeAll();
        }
      );
    });
  }

  private clearOldValues() {
    this.listings = [];
    this.importError = null;
    this.currentestimateFee = null;
    this.selectedCountry = null;
    this.selectedExpiration = null;
  }

  clearEstimate() {
    this.currentestimateFee = null;
  }

  onCountryChange(country: Country): void {
    this.selectedCountry = country;
  }

  tabChange(tab: any) {
    this.clearOldValues();

    this.availableImports[tab.index].form.reset();
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

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
