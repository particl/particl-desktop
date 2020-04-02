import { Component } from '@angular/core';


@Component({
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
})
export class ProposalsComponent {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['active', 'past'];

  changeTab(index: number): void {
    this.selectedTab = index;
    //this.stopTimer();
    //this.loadProposals();
  }

}
