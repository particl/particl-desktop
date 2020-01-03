import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {
  public isLoading: boolean = false;
  public isPageLoading: boolean = false;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['available', 'joined'];
  public showJoinMarketForm: boolean = false;

  markets_sortings: Array<any> = [
    { title: 'By title', value: 'TITLE' },
    { title: 'By ??', value: '??' }
  ];

  markets_filtering: Array<any> = [
    { title: 'All markets',       value: '' },
    { title: 'Community Markets', value: 'community' },
    { title: 'Storefronts',       value: 'storefronts' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  createMarket(id?: number, clone?: boolean) {
    this.router.navigate(['../create-market'], {
      relativeTo: this.route,
      queryParams: {'id': id, 'clone': clone }
    });
  }

  changeTab(index: number): void {
    //this.clear();
    this.selectedTab = index;
  }

}
