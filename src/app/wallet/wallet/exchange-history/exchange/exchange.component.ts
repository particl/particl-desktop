import { Component, ViewChild, ChangeDetectorRef, AfterViewChecked, OnDestroy, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material';
import { BotService } from 'app/core/bot/bot.module';
import { RpcService, RpcStateService } from 'app/core/core.module';
import { Exchange } from './exchange';

import * as _ from 'lodash';
import { ModalsHelperService } from 'app/modals/modals.module';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements AfterViewChecked, OnInit, OnDestroy  {

  @ViewChild('stepper') stepper: MatStepper;

  public exchange: any = null;
  public updateInProgress: any = {};

  public exchangeStatus$: Subscription;
  public unlock$: Subscription;

  constructor (
    private changeDetect: ChangeDetectorRef,
    private botService: BotService,
    private rpc: RpcService,
    private rpcState: RpcStateService,
    private modal: ModalsHelperService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const paramsMap = this.route.snapshot.queryParamMap;

    const requiredPart = paramsMap.get('requiredPart');
    
    this.unlock(300).pipe(take(1)).subscribe(
      () => this.startNewExchange(requiredPart),
      () => this.router.navigate(['wallet', 'main', 'wallet', 'exchange-history'])
    );
  }

  ngAfterViewChecked(): void {
    this.changeDetect.detectChanges();
  }

  ngOnDestroy() {
    this.cancelExchange();
  }

  async startNewExchange(amount?: string) {
    if (this.stepper) {
      this.stepper.reset();
    }
    if (this.exchangeStatus$) {
      this.exchangeStatus$.unsubscribe();
    }
    
    this.exchange = new Exchange(this.botService, this.rpc);

    if (amount) {
      this.exchange.requiredParticls = amount
    }

    this.unlock$ = this.rpcState.observe('locked').subscribe(async (locked) => {
      if (locked && this.exchange.loading) {
        await this.unlock(300).toPromise();
      }
    });
  }

  cancelExchange() {
    if (this.exchange) {
      this.exchange.clearRequests();
    }
    this.exchange = null;

    if (this.exchangeStatus$) {
      this.exchangeStatus$.unsubscribe();
    }
    if (this.unlock$) {
      this.unlock$.unsubscribe();
    }
  }

  async nextStep() {
    this.stepper.steps.toArray()[this.stepper.selectedIndex].completed = true;
    this.stepper.next();

    this.exchange.clearRequests();

    switch (this.stepper.selectedIndex) {
      case 1:
        await this.unlock(300).toPromise();
        this.exchange.getExchangeOffers();
        break;
      case 2:
        await this.unlock(300).toPromise();
        await this.exchange.getExchangeAddress();

        this.exchangeStatus$ = timer(0, 60000).pipe(
          switchMap(() => this.unlock(300)),
          switchMap(() => this.exchange.getExchangeStatusUpdate())
        ).subscribe((status: any) => {
          if (status.data && status.data.tx_to) {
            this.exchangeStatus$.unsubscribe();
          }
        });
        break;
    }
  }

  prevStep() {
    this.exchange.clearRequests();
    this.stepper.previous();
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  private unlock(timeout?: number): Observable<any> {
    return new Observable((observer) => {
      this.modal.unlock({timeout},
        () => {observer.next(); observer.complete()},
        () => {observer.error(); observer.complete()})
    });
  }

  gotoBotManagement() {
    this.router.navigate(['wallet', 'main', 'bot', 'list']);
  }
}
