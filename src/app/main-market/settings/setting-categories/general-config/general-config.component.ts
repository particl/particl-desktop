import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ComponentFactoryResolver, OnDestroy, ViewChild, ViewContainerRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../../store/market.state';
import { MarketUserActions } from '../../../store/market.actions';

import { RegionListService } from '../../../services/region-list/region-list.service';
import { NumberSettingComponent, NumberSettingDetails } from 'app/main/components/settings/components/number.component';
import { ToggleSettingComponent } from 'app/main/components/settings/components/toggle.component';
import { SettingField } from 'app/main/components/settings/abstract-setting.model';
import { SelectSettingComponent, SelectSettingField } from 'app/main/components/settings/components/select.component';
import { MarketStateModel, StartedStatus } from '../../../store/market.models';


@Component({
  templateUrl: './general-config.component.html',
  styleUrls: ['./general-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralConfigComponent implements AfterViewInit, OnDestroy {

  @ViewChild('profileContainer', {static: false, read: ViewContainerRef}) profileContainer: ViewContainerRef;
  @ViewChild('advancedContainer', {static: false, read: ViewContainerRef}) advancedContainer: ViewContainerRef;


  private destroy$: Subject<void> = new Subject();


  constructor(
    private _resolver: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _regionService: RegionListService,
  ) { }


  ngAfterViewInit(): void {
    this._store.select(MarketState.startedStatus).pipe(
      map(status => status === StartedStatus.STARTED),
      distinctUntilChanged(),
      tap({
        next: isStarted => this.loadSettings(isStarted)
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadSettings(isMarketStarted: boolean): void {
    this.profileContainer.clear();
    this.advancedContainer.clear();

    const selectFactory = this._resolver.resolveComponentFactory(SelectSettingComponent);
    const numberFactory = this._resolver.resolveComponentFactory(NumberSettingComponent);
    const toggleFactory = this._resolver.resolveComponentFactory(ToggleSettingComponent);

    const marketState = this._store.selectSnapshot<MarketStateModel>(MarketState);
    const marketSettings = marketState.settings;


    const selectDefaultIDSettings: SelectSettingField = {
      title: 'Default Identity',
      description: `The identity to default to using at startup (if multiple identities are enabled)`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: '',
      placeholder: `Default Identity`,
      options: marketState.identities.map(id => ({label: id.displayName, value: id.id})),
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.defaultIdentityID', +newValue));
      },
      value: marketSettings.defaultIdentityID,
    };

    const selectDefaultIDComp = this.profileContainer.createComponent(selectFactory);
    selectDefaultIDComp.instance.setting = selectDefaultIDSettings;


    const selectShippingRegionSettings: SelectSettingField = {
      title: 'Default Shipping Region',
      description: `The region to default shipping calculation costs to.`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: '',
      placeholder: ``,
      options: this._regionService.getCountryList().map(c => ({label: c.name, value: c.iso})),
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.userRegion', newValue));
      },
      value: marketSettings.userRegion,
    };

    const selectShippingRegionComp = this.profileContainer.createComponent(selectFactory);
    selectShippingRegionComp.instance.setting = selectShippingRegionSettings;


    const numCommentCountSettings: SettingField<number> = {
      title: 'Paginated Comment Count',
      description: `The number of comment threads to load by default`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: 20,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.defaultListingCommentPageCount', +newValue));
      },
      value: marketSettings.defaultListingCommentPageCount,
    };
    const numCommentCountDetails: NumberSettingDetails = {
      min: 1,
      max: 900,
      step: 1
    };
    const numCommentCountComp = this.profileContainer.createComponent(numberFactory);
    numCommentCountComp.instance.details = numCommentCountDetails;
    numCommentCountComp.instance.setting = numCommentCountSettings;


    const numListingExpirySettings: SettingField<number> = {
      title: 'Num Days To Display Listing Expiry',
      description: `Once your own published listing has expired, after how many days do you still want to be notified of its expiry (min: 1, max: 31)`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: 7,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.daysToNotifyListingExpired', +newValue));
      },
      value: marketSettings.daysToNotifyListingExpired,
    };
    const numListingExpiryDetails: NumberSettingDetails = {
      min: 1,
      max: 31,
      step: 1
    };
    const numListingExpiryComp = this.profileContainer.createComponent(numberFactory);
    numListingExpiryComp.instance.details = numListingExpiryDetails;
    numListingExpiryComp.instance.setting = numListingExpirySettings;



    const boolModIdentitiesSettings: SettingField<boolean> = {
      title: 'Enable multiple identities for the current profile',
      description: `Warning! Enabling this should be considered experimental at this time AND requires manual intervention for various actions such as backups and restorations. Please only enable this if you know what you are doing!`,
      tags: ['experimental'],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: false,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.canModifyIdentities', newValue));
      },
      value: marketSettings.canModifyIdentities,
    };
    const boolModIdentitiesComp = this.advancedContainer.createComponent(toggleFactory);
    boolModIdentitiesComp.instance.setting = boolModIdentitiesSettings;


    const boolUseAnonBalanceSettings: SettingField<boolean> = {
      title: 'Use Spendable (Anon) balance for publishing fees',
      description: `While allowing for better anonymity of your publishing identity, this results in higher fees and may cause issues such as impacting the ability to batch publish listings or causing delays to published item visibility.`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: false,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.useAnonBalanceForFees', newValue));
      },
      value: marketSettings.useAnonBalanceForFees,
    };
    const boolUseAnonBalanceComp = this.advancedContainer.createComponent(toggleFactory);
    boolUseAnonBalanceComp.instance.setting = boolUseAnonBalanceSettings;


    const boolPaidImagesSettings: SettingField<boolean> = {
      title: 'Use Paid SMSG for publishing images',
      description: `Using paid SMSG (default) allows for larger images to be used but incurs a small fee per image, whereas free messages have no fees but have a greatly reduced image size.`,
      tags: [],
      isDisabled: !isMarketStarted,
      requiresRestart: false,
      defaultValue: true,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!isMarketStarted) {
          return;
        }
        this._store.dispatch(new MarketUserActions.SetSetting('profile.usePaidMsgForImages', newValue));
      },
      value: marketSettings.usePaidMsgForImages,
    };
    const boolPaidImagesComp = this.advancedContainer.createComponent(toggleFactory);
    boolPaidImagesComp.instance.setting = boolPaidImagesSettings;


    this._cdr.detectChanges();
  }
}
