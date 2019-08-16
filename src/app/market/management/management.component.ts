import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['available', 'joined'];

  constructor() { }

  ngOnInit() {
  }

  changeTab(index: number): void {
    //this.clear();
    this.selectedTab = index;
  }

}
