import { Component, OnInit} from '@angular/core';

import { MultiwalletService, IWallet } from 'app/core/multiwallet/multiwallet.service';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnInit, OnDestroy {


  private destroyed: boolean = false;

  private list: Array<IWallet> = [];

  constructor(
    private multi: MultiwalletService
  ) { 
    // get wallet list
    this.multi.list
      .takeWhile(() => !this.destroyed)
      .subscribe((list) => {
        this.list = list;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
