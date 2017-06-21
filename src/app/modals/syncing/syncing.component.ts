import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-syncing',
  templateUrl: './syncing.component.html',
  styleUrls: ['./syncing.component.scss']
})
export class SyncingComponent implements OnInit {

  public blocksRemaining: number = 44400;
  public lastBlockTime: string = 'Mon. Sep. 24 21:40:46 2012';
  public increasePerHour: number = 2.18;
  public estimatedTimeLeft: string = '44 hour(s)';

  constructor() { }

  ngOnInit() {
  }

}
