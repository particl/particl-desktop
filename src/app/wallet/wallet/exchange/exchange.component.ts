import { Component, ViewChild, ChangeDetectorRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { MatStepper } from '@angular/material';
import { BotService } from 'app/core/bot/bot.module';
import { RpcService, SnackbarService } from 'app/core/core.module';
import { Exchange } from './exchange';

import * as _ from 'lodash';

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
    private snackbarService: SnackbarService
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

  startNewExchange() {
    if (this.stepper) {
      this.stepper.reset();
    }
    this.exchange = new Exchange(this.botService, this.rpc);
  }

  cancelExchange() {
    if (this.exchange) {
      this.exchange.clearRequests();
    }
    this.exchange = null;
  }

  nextStep() {
    this.stepper.steps.toArray()[this.stepper.selectedIndex].completed = true;
    this.stepper.next();

    this.exchange.clearRequests();

    switch (this.stepper.selectedIndex) {
      case 1:
        this.exchange.getExchangeOffers();
        break;
      case 2:
        this.exchange.getExchangeAddress();
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
}
