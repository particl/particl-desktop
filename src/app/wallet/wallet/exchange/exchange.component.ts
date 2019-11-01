import { Component, ViewChild, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { MatStepper } from '@angular/material';
import { BotService } from 'app/core/bot/bot.module';
import { RpcService, SnackbarService } from 'app/core/core.module';
import { Exchange } from './exchange';

import * as _ from 'lodash';
import { ModalsHelperService } from 'app/modals/modals.module';
import { Observable, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const TABS = ['exchange', 'exchangeHistory'];

interface IPage {
  pageNumber: number,
  exchanges: Array<any>;
}

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements AfterViewChecked, OnDestroy  {

  @ViewChild('stepper') stepper: MatStepper;

  tab: string = TABS[0];

  public exchange: any = null;
  public updateInProgress: any = {};

  public isLoading: boolean = true;
  public pages: Array<IPage> = [];
  public pagination: any = {
    maxPerPage: 20,
    infinityScrollSelector: '.mat-drawer-content'
  };
  public exchangeData: any = {};
  public exchangeStatus$: Subscription;

  public filters: any = {
    search: '',
    bot: '',
    from: '',
    to: ''
  }

  constructor (
    private changeDetect: ChangeDetectorRef,
    private botService: BotService,
    private rpc: RpcService,
    private snackbarService: SnackbarService,
    private modal: ModalsHelperService
  ) {}

  ngAfterViewChecked(): void {
    this.changeDetect.detectChanges();
  }

  ngOnDestroy() {
    this.cancelExchange();
  }

  async selectTab(tabIndex: number) {
    this.tab = TABS[tabIndex];

    if (this.tab === 'exchangeHistory') {
      this.exchangeData = await this.botService.uniqueExchangeData();
      this.cancelExchange();
      this.isLoading = true;
      this.loadPage(0);
    }
  }

  clearAllFilters() {
    this.filters = {
      search: '',
      bot: '',
      from: '',
      to: ''
    };
    this.search();
  }

  async startNewExchange() {
    if (this.stepper) {
      this.stepper.reset();
    }
    if (this.exchangeStatus$) {
      this.exchangeStatus$.unsubscribe();
    }
    await this.unlock(300).toPromise();
    this.exchange = new Exchange(this.botService, this.rpc);
  }

  cancelExchange() {
    if (this.exchange) {
      this.exchange.clearRequests();
    }
    if (this.exchangeStatus$) {
      this.exchangeStatus$.unsubscribe();
    }
    this.exchange = null;
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

  search() {
    this.loadPage(0, true);
  }

  async loadPage(pageNumber: number, clear: boolean = false) {
    const exchanges = await this.botService.searchExchanges(pageNumber, 10, this.filters.bot,
       this.filters.from, this.filters.to, this.filters.search);

    this.isLoading = false;

    let existingPage;
    if (clear) {
      this.pages = []
    } else {
      existingPage = _.find(this.pages, (page) => page.pageNumber === pageNumber);
    }

    if (existingPage) {
      existingPage.exchanges = exchanges;
    } else {
      if (exchanges.length > 0) {
        this.pages.push({
          pageNumber: pageNumber,
          exchanges
        });
      } else {
        if (pageNumber === 0) {
          this.pages.push({
            pageNumber: pageNumber,
            exchanges: []
          });
        }
      }
    }
  }

  loadNextPage() {
    let nextPage = this.getLastPageCurrentlyLoaded();
    nextPage++;
    this.loadPage(nextPage);
  }

  getLastPageCurrentlyLoaded() {
    return this.pages.length > 0 && this.pages[this.pages.length - 1].pageNumber;
  }

  async requestUpdate(e: any, exchange: any, pageIndex: number) {
    e.stopPropagation();
    this.updateInProgress[exchange.track_id] = true;
    const update = await this.botService.command(exchange.bot.address, 'EXCHANGE_STATUS', exchange.track_id).toPromise();
    if (update.error) {
      this.snackbarService.open(update.error);
    }
    this.loadPage(pageIndex);
    delete this.updateInProgress[exchange.track_id];
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  private unlock(timeout?: number): Observable<any> {
    return new Observable((observer) => {
      this.modal.unlock({timeout},
        ()=> {observer.next(); observer.complete()},
        ()=> {observer.error(); observer.complete()})
    });
  }
}
