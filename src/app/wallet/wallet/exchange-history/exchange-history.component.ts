import { Component, AfterViewChecked, OnDestroy, OnInit } from '@angular/core';
import { BotService } from 'app/core/bot/bot.module';
import { SnackbarService, RpcStateService } from 'app/core/core.module';

import * as _ from 'lodash';
import { ModalsHelperService } from 'app/modals/modals.module';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';


interface IPage {
  pageNumber: number,
  exchanges: Array<any>;
}

@Component({
  selector: 'app-exchange-history',
  templateUrl: './exchange-history.component.html',
  styleUrls: ['./exchange-history.component.scss']
})
export class ExchangeHistoryComponent implements AfterViewChecked, OnInit, OnDestroy  {

  public isLoading: boolean = true;
  public pages: Array<IPage> = [];
  public pagination: any = {
    maxPerPage: 20,
    infinityScrollSelector: '.mat-drawer-content'
  };
  public exchangeData: any = {};
  public updateInProgress: any = {};

  public filters: any = {
    search: '',
    bot: '',
    from: '',
    to: ''
  }

  private destroyed: boolean = false;

  constructor (
    private botService: BotService,
    private snackbarService: SnackbarService,
    private modal: ModalsHelperService,
    private rpcState: RpcStateService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.exchangeData = await this.botService.uniqueExchangeData();
    this.isLoading = true;
    this.loadPage(0);
  }

  ngAfterViewChecked(): void {
  }

  ngOnDestroy() {
    this.destroyed = true;
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

    await this.unlock(300).toPromise();

    const unlock$ = this.rpcState.observe('locked').pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(async (locked) => {
      if (locked) {
        await this.unlock(300).toPromise();
      }
    });

    this.updateInProgress[exchange.track_id] = true;
    const update = await this.botService.command(exchange.bot.address, 'EXCHANGE_STATUS', exchange.track_id).toPromise();
    if (update.error) {
      this.snackbarService.open(update.error);
    }
    this.loadPage(pageIndex);
    delete this.updateInProgress[exchange.track_id];
    unlock$.unsubscribe();
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

  gotoExchange() {
    this.router.navigate(['wallet', 'main', 'wallet', 'exchange']);
  }
}
