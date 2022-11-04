import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { GeneralConfigComponent } from './categories/general-config/general-config.component';
import { WalletSpecificSettingsComponent } from './categories/wallet-settings/wallet-settings.component';


interface SettingCategory {
  label: string;
  icon: string;
  component: any;
}


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletSettingsComponent implements AfterViewInit {

  @ViewChild('settingPageCategory', {static: false, read: ViewContainerRef}) categoryPageContainer: ViewContainerRef;

  readonly pageDetails: Readonly<{title: string; description: string; help: string}> = {
    title: 'Particl Wallet Related Settings',
    description: 'Adjust module configuration options that apply to all wallets, as well as settings that apply for the current selected wallet.',
    help: ''
  };

  settingsMenu: SettingCategory[] = [
    {
      label: 'Wallet Specific Settings',
      icon: 'part-stake',
      component: WalletSpecificSettingsComponent
    },
    {
      label: 'Configuration Settings',
      icon: 'part-preferences',
      component: GeneralConfigComponent

    },
  ];

  private _currentMenuIdx: number = -1;


  constructor(
    private _resolver: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.changeSelectedMenu(0);
  }


  get currentMenuIdx(): number {
    return this._currentMenuIdx;
  }


  changeSelectedMenu(idx: number) {
    if (idx >= 0 && idx < this.settingsMenu.length && idx !== this._currentMenuIdx) {
      this._currentMenuIdx = idx;
      this.categoryPageContainer.clear();
      const compFactory = this._resolver.resolveComponentFactory(this.settingsMenu[this._currentMenuIdx].component);
      this.categoryPageContainer.createComponent(compFactory);
      this._cdr.detectChanges();
    }
  }


  trackBySettingMenuFn(idx: number, item: SettingCategory) {
    return idx;
  }
}
