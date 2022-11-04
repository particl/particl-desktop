import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Observable, Subject, merge } from 'rxjs';
import { distinctUntilChanged, takeUntil, switchMap } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';
import { StakingInfoService } from './staking-info.service';
import { RPCResponses } from 'app/networks/particl/particl.models';


interface NumericStat {
  whole: string;
  sep: string;
  fraction: string;
}


@Component({
  selector: 'widget-stakinginfo',
  templateUrl: './staking-info-widget.component.html',
  styleUrls: ['./staking-info-widget.component.scss'],
  providers: [StakingInfoService]
})
export class StakingInfoWidgetComponent implements AfterViewInit, OnDestroy {

  @Select(Particl.State.ZMQ.getData('hashblock')) blockWatcher$: Observable<string>;
  @Select(Particl.State.Wallet.Info.getValue('walletname')) walletSwitcher$: Observable<string>;

  stakingEnabled: boolean;
  nextRewardTime: string;
  ownWeight: NumericStat;

  annualPercent: string;
  difficulty: NumericStat;
  moneySupply: NumericStat;
  totalStakingAmount: NumericStat;
  totalStakingPercent: NumericStat;
  rewardDistribution: NumericStat;


  private destroy$: Subject<void> = new Subject();
  private monitor$: Observable<RPCResponses.GetStakingInfo>;


  constructor(
    private _stakingService: StakingInfoService
  ) {

    this.resetStats();

    this.monitor$ = merge(
      this.blockWatcher$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.walletSwitcher$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
    ).pipe(
      switchMap(() => this.fetchStakingInfo()),
      takeUntil(this.destroy$)
    );
  }


  ngAfterViewInit() {
    this.monitor$.subscribe({
      next: this.successHandler.bind(this),
      error: this.errorHandler.bind(this),
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private resetStats() {
    this.nextRewardTime = this.calculateRemainingTime(0);
    this.stakingEnabled = true;

    this.ownWeight = {whole: '-', sep: '', fraction: ''};

    this.annualPercent = '';
    this.difficulty = {whole: '-', sep: '', fraction: ''};
    this.moneySupply = {whole: '-', sep: '', fraction: ''};
    this.totalStakingAmount = {whole: '-', sep: '', fraction: ''};
    this.totalStakingPercent = {whole: '-', sep: '', fraction: ''};
    this.rewardDistribution = {whole: '-', sep: '', fraction: ''};
  }


  private fetchStakingInfo(): Observable<RPCResponses.GetStakingInfo> {
    return this._stakingService.getStakingStats();
  }


  private successHandler(response: RPCResponses.GetStakingInfo): void {
    this.resetStats();

    const percentyearreward = +response.percentyearreward || 0;
    const netstakeweight = +response.netstakeweight || 0;
    const weight = +response.weight || 0;
    const moneySupply = +response.moneysupply || 0;

    this.stakingEnabled = typeof response.enabled === 'boolean' ? response.enabled : false;
    this.annualPercent = `${percentyearreward}`;
    this.nextRewardTime = this.calculateRemainingTime(+response.expectedtime);
    this.difficulty = this.convertToNumericStat(+response.difficulty || 0, 2);
    this.moneySupply = this.convertToNumericStat(moneySupply, 2);
    this.totalStakingAmount = this.convertToNumericStat(netstakeweight / Math.pow(10, 8), 3);

    if (netstakeweight > 0) {
      const weightCalc = ((weight / netstakeweight) * 100);
      this.ownWeight = this.convertToNumericStat(weightCalc, 5);
    }

    if (moneySupply > 0) {
      const totalPercent = netstakeweight / Math.pow(10, 8) / moneySupply * 100;

      this.totalStakingPercent = this.convertToNumericStat(totalPercent, 2);

      if (+totalPercent > 0) {
        const effectivePercent = percentyearreward * 100 / totalPercent;
        this.rewardDistribution = this.convertToNumericStat(effectivePercent, 2);
      }
    }
  }


  private calculateRemainingTime(seconds: number) {
    const years: number = Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hour*/ * 365 /*days*/ ));
    const months: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ * 30.5 /*months*/ )) - years * 12;
    const days: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ )) - months * 30.5;
    const hours: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ )) - days * 24;
    const minutes: number =  Math.floor(seconds / (60 /*s*/ )) - hours * 60;

    if (years > 0) {
      return  years + ' years';
    } else if (months > 0) {
      return  months + ' months';
    } else if (days > 0) {
      return  days + ' days';
    } else if (hours > 0) {
      return  hours + ' hours';
    } else if (minutes > 0) {
      return  minutes + ' minutes';
    } else if (seconds > 0) {
      return  '< 1 minute' ;
    }
    return 'unknown';
  }


  private errorHandler(): void {
    this.resetStats();
  }


  private convertToNumericStat(amount: number, precision: number = 2): NumericStat {
    // const parts = amount.toPrecision(precision + 1).split('.');
    const parts = Math.fround(amount).toFixed(precision).split('.');

    const resp = {
      whole: `${parts[0] || 0}`,
      sep: '',
      fraction: ''
    } as NumericStat;

    if (+parts[1] > 0) {
      resp.sep = '.';
      resp.fraction = `${+parts[1]}`;
    }

    return resp;
  }

}
