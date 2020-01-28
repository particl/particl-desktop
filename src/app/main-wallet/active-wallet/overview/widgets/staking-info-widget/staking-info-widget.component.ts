import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Log } from 'ng2-logger';

import { Observable, Subject, merge } from 'rxjs';
import { auditTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs/operators';
import { StakingInfoService } from './staking-info.service';
import { ZmqConnectionState } from 'app/core/store/zmq-connection.state';
import { WalletInfoState } from 'app/main/store/main.state';
import * as zmqOptions from '../../../../../../../modules/zmq/services.js';
import { RpcGetStakingInfo } from './staking-info-widget.models.js';

@Component({
  selector: 'widget-stakinginfo',
  templateUrl: './staking-info-widget.component.html',
  styleUrls: ['./staking-info-widget.component.scss'],
  providers: [StakingInfoService]
})
export class StakingInfoWidgetComponent implements AfterViewInit, OnDestroy {

  @Select(ZmqConnectionState.getData('hashblock')) blockWatcher$: Observable<string>;
  @Select(WalletInfoState.getValue('walletname')) walletSwitcher$: Observable<string>;

  nextRewardTime: string;
  stakingWeightWhole: string;
  stakingWeightFraction: string;
  stakingPercentage: string;
  stakingEnabled: boolean;


  private log: any = Log.create('staking-info-widget.component' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();
  private monitor$: Observable<RpcGetStakingInfo>;


  constructor(
    private _stakingService: StakingInfoService
  ) {

    this.resetStats();

    this.monitor$ = merge(
      this.blockWatcher$.pipe(
        auditTime(zmqOptions.throlledSeconds * 1000),
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
    )
  }


  ngAfterViewInit() {
    this.monitor$.subscribe(
      this.successHandler.bind(this),
      this.errorHandler.bind(this)
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private resetStats() {
    this.nextRewardTime = this.calculateRemainingTime(0);
    this.stakingWeightWhole = '-';
    this.stakingWeightFraction = '';
    this.stakingPercentage = '-';
    this.stakingEnabled = true;
  }


  private fetchStakingInfo(): Observable<RpcGetStakingInfo> {
    return this._stakingService.getStakingStats();
  }


  private successHandler(response: RpcGetStakingInfo): void {
    this.resetStats();

    const percentyearreward = +response.percentyearreward || 0;
    const netstakeweight = +response.netstakeweight || 0;
    const weight = +response.weight || 0;

    this.stakingEnabled = typeof response.enabled === 'boolean' ? response.enabled : false;
    this.stakingPercentage = `${percentyearreward}`;
    this.nextRewardTime = this.calculateRemainingTime(+response.expectedtime);

    if (netstakeweight > 0) {
      const weightCalc = ((weight / netstakeweight) * 100).toPrecision(6);
      const weightParts = weightCalc.split('.');

      this.stakingWeightWhole = weightParts[0];
      if (+weightParts[1] > 0) {
        this.stakingWeightFraction = weightParts[1];
      }
    }
  }


  private calculateRemainingTime(seconds: number) {
    const years: number = Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hour*/ * 365/*days*/));
    const months: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ * 30.5/*months*/)) - years * 12;
    const days: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24/*hours*/)) - months * 30.5;
    const hours: number =  Math.floor(seconds / (60 /*s*/ * 60/*min*/)) - days * 24;
    const minutes: number =  Math.floor(seconds / (60/*s*/)) - hours * 60;

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
    this.log.er('Requesting staking stats failed');
    this.resetStats();
  }

}
