import { Component, OnInit } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public selectedTabIdx: number = 0;
  public walletName: string = '';
  public settingTabs: Array<any> = [
    { title: 'Wallet Settings', icon: 'part-hamburger'}
    , { title: 'Global', icon: 'part-hamburger'}
  ];

  constructor(private _rpc: RpcService) { }

  ngOnInit() {
    this.walletName = this._rpc.wallet;
  }

  changeTab(idx: number): void {
    if (idx >= 0 && idx < this.settingTabs.length) {
      this.selectedTabIdx = idx;
    }
  }
}
