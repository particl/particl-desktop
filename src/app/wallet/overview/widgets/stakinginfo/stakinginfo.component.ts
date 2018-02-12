import { Component, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../../core/core.module';
import { Amount, Duration } from '../../../../core/util/utils';

@Component({
  selector: 'app-stakinginfo',
  templateUrl: './stakinginfo.component.html',
  styleUrls: ['./stakinginfo.component.scss']
})
export class StakinginfoComponent implements OnDestroy {


  /*  General   */
  private log: any = Log.create('stakinginfo.component' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;


  /*  UI   */
  public dynamicStakingReward: Amount = new Amount(0);
  public ownPercentageOfActiveStakingSupply: Amount = new Amount(0);
  public curStakeReward: Amount = new Amount(0);
  public expectedtime: Duration = new Duration(0);

  /*  RPC   */
  public weight: number = 1;
  public netstakeweight: number = 1;
  private moneysupply: number = 0;


  constructor(
    private rpcState: RpcStateService
    ) {

    this.log.d(`constructor, started`);
    this.rpcState.observe('getstakinginfo', 'percentyearreward')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      success => {
        this.log.d(`setting curStakeReward ${success}`);
        this.curStakeReward = new Amount(success, 2);
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, percentyearreward error:' + error));

    this.rpcState.observe('getstakinginfo', 'weight')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      success => {
        this.log.d(`setting weight ${success}`);
        this.weight = success;
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, weight error:' + error),
      () => this.log.d('state observe weight completed!'));

    this.rpcState.observe('getstakinginfo', 'netstakeweight')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      success => {
        this.log.d(`setting netstakeweight ${success}`);
        this.netstakeweight = success;
      },
      error => this.log.er('Constructor, netstakeweight error:' + error));

    this.rpcState.observe('getstakinginfo', 'moneysupply')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      success => {
        this.log.d(`setting moneysupply ${success}`);
        this.moneysupply = success;
        this.calculateDynamicStakingReward();
      },
      error => this.log.er('Constructor, moneysupply error:' + error));

    this.rpcState.observe('getstakinginfo', 'expectedtime')
    .takeWhile(() => !this.destroyed)
    .subscribe(
      success => {
        this.log.d(`setting expectedtime ${success}`);
        this.expectedtime = new Duration(success);
      },
      error => this.log.er('Constructor, expectedtime error:' + error));

  }

  private calculateDynamicStakingReward(): void {
    this.ownPercentageOfActiveStakingSupply = new Amount((this.weight / this.netstakeweight) * 1000, 5);
    this.dynamicStakingReward = new Amount(this.curStakeReward.getAmount() * (this.moneysupply / (this.netstakeweight / 10000000)), 2);

    this.log.d(`calculateDynamicStakingReward, dynamicStakingReward = ${this.dynamicStakingReward}`);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
