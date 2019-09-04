import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['one', 'two', 'three']; // FIXME: remove sell_item and leave as a separate page?

  constructor() { }

  ngOnInit() {
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }
  
}
