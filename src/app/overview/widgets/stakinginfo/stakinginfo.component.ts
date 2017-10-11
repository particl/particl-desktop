import { Component, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { RPCService } from '../../../core/rpc/rpc.module';

@Component({
  selector: 'app-stakinginfo',
  templateUrl: './stakinginfo.component.html',
  styleUrls: ['./stakinginfo.component.scss']
})
export class StakinginfoComponent implements OnInit {


  /*  General   */
  log: any = Log.create('send.component');


  /*  UI   */
  dynamicStakingReward: number;

  /*  RPC   */
  private curStakeReward: number = 0;
  private curWeight: number = 1;
  private curSupply: number = 0;


  constructor(
    private _rpc: RPCService
  ) {
    this.log.d(`constructor, started`);
    this._rpc.state.observe('percentyearreward')
      .subscribe(
        success => {
          this.log.d(`setting curStakeReward ${success}`);
          this.curStakeReward = success;
          this.calculateDynamicStakingReward();
        },
        error => this.log.er('Constructor, percentyearreward error:' + error));


    this._rpc.state.observe('netstakeweight')
      .subscribe(
        success => {
          this.log.d(`setting weight ${success}`);
          this.curWeight = success / (10000000);
          this.calculateDynamicStakingReward();
        },
        error => this.log.er('Constructor, weight error:' + error));

    this._rpc.state.observe('moneysupply')
      .subscribe(
        success => {
          this.log.d(`setting moneysupply ${success}`);
          this.curSupply = success;
          this.calculateDynamicStakingReward();
        },
        error => this.log.er('Constructor, moneysupply error:' + error));

  }

  ngOnInit() {
  }


  calculateDynamicStakingReward() {
    this.dynamicStakingReward = Math.floor(this.curStakeReward * (this.curSupply / this.curWeight));
    this.log.d(`calculateDynamicStakingReward, dynamicStakingReward = ${this.dynamicStakingReward}`);
  }
}
