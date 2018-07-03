import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
})

export class ProposalsComponent {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['active', 'past'];

  constructor() { }
  
  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
