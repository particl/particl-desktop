import { Component } from '@angular/core';
import { Log } from 'ng2-logger';

import { StateService } from '../../../core/state/state.service';
import { Amount, Duration } from './util';

@Component({
  selector: 'app-stakinginfo',
  templateUrl: './stakinginfo.component.html',
  styleUrls: ['./stakinginfo.component.scss']
})
export class StakinginfoComponent {


  /*  General   */
  private log: any = Log.create('send.component');


  /*  UI   */
  public dynamicStakingReward: Amount = new Amount(0);
  public ownPercentageOfActiveStakingSupply: Amount = new Amount(0);

  public expectedtime: Duration = new Duration(0);

  /*  RPC   */
  private curStakeReward: number = 0;

  public weight: number = 1;
  public netstakeweight: number = 1;
  private moneysupply: number = 0;


  constructor(
    private state: StateService
    ) {

    this.log.d(`constructor, started`);
    this.state.observe('percentyearreward')
    .subscribe(
      success => {
        this.log.d(`setting curStakeReward ${success}`);
        this.curStakeReward = success;
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, percentyearreward error:' + error));

    this.state.observe('weight')
    .subscribe(
      success => {
        this.log.d(`setting weight ${success}`);
        this.weight = success;
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, weight error:' + error));

    this.state.observe('netstakeweight')
    .subscribe(
      success => {
        this.log.d(`setting netstakeweight ${success}`);
        this.netstakeweight = success;
      },
      error => this.log.er('Constructor, netstakeweight error:' + error));

    this.state.observe('moneysupply')
    .subscribe(
      success => {
        this.log.d(`setting moneysupply ${success}`);
        this.moneysupply = success;
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, moneysupply error:' + error));

    this.state.observe('expectedtime')
    .subscribe(
      success => {
        this.log.d(`setting expectedtime ${success}`);
        this.expectedtime = new Duration(success);
      },
      error => this.log.er('Constructor, expectedtime error:' + error));

  }

  private calculateDynamicStakingReward() {
    this.ownPercentageOfActiveStakingSupply = new Amount((this.weight / this.netstakeweight) * 100);
    this.dynamicStakingReward = new Amount(this.curStakeReward * (this.moneysupply / (this.netstakeweight / 10000000)));

    this.log.d(`calculateDynamicStakingReward, dynamicStakingReward = ${this.dynamicStakingReward}`);
  }

}
