import { Component, AfterViewChecked, OnDestroy, OnInit } from '@angular/core';
import { BotService } from 'app/core/bot/bot.service';
import { SnackbarService, RpcStateService } from 'app/core/core.module';

import * as _ from 'lodash';
import { ModalsHelperService } from 'app/modals/modals.module';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { DateFormatter } from 'app/core/util/utils';
import { Log } from 'ng2-logger';


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

  log: any = Log.create('exchange-history.component');

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
    to: '',
    hideCompleted: false,
    hideCancelled: true
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
    try {
      this.exchangeData = await this.botService.uniqueExchangeData();
    } catch (e) {
      this.log.er(e);
      this.exchangeData = {
        bots: [],
        currency_from: [],
        currency_to: []
      }
    }
    this.isLoading = true;
    this.loadPage(0);

    this.rpcState.observe('locked').pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(async (locked) => {
      if (locked && Object.keys(this.updateInProgress).length > 0) {
        try {
          await this.unlock(300).toPromise();
        } catch (e) {
          this.snackbarService.open('Wallet needs to be unlocked to receive response from the bot.');
        }
      }
    });
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
      to: '',
      hideCompleted: false,
      hideCancelled: true
    };
    this.search();
  }

  search() {
    this.loadPage(0, true);
  }

  async loadPage(pageNumber: number, clear: boolean = false) {
    try {
      const completed = this.filters.hideCompleted ? false : null;
      const cancelled = this.filters.hideCancelled ? false : null;

      const exchanges = await this.botService.searchExchanges(pageNumber, 10, this.filters.bot,
        this.filters.from, this.filters.to, this.filters.search, completed, cancelled);

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
    } catch (e) {
      this.log.er(e);
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

    try {
      await this.unlock(300).toPromise();
    } catch (e) {
      this.snackbarService.open('Wallet needs to be unlocked to request status update.');
      return;
    }

    this.updateInProgress[exchange.track_id] = true;
    try {
      const update = await this.botService.command(exchange.bot.address, 'EXCHANGE_STATUS', exchange.track_id).toPromise();

      if (update.error) {
        this.snackbarService.open(update.error);
      }
    } catch (e) {
      this.log.er(e);
      this.snackbarService.open('Error requesting status update.');
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
        () => {observer.next(); observer.complete()},
        () => {observer.error(); observer.complete()})
    });
  }

  async cancelExchange(track_id: string, pageIndex: number) {
    try {
      await this.botService.cancelExchange(track_id);

      for (const page of this.pages) {
        if (page.pageNumber >= pageIndex) {
          this.loadPage(page.pageNumber);
        }
      }
    } catch (e) {
      this.snackbarService.open(e.error.message);
    }
  }

  gotoExchange() {
    this.router.navigate(['wallet', 'main', 'wallet', 'exchange']);
  }

  gotoBotManagement() {
    this.router.navigate(['wallet', 'main', 'bot', 'list']);
  }

  formatDate(date: string): string {
    if (!date) {
      return '';
    }
    return new DateFormatter(new Date(date)).dateFormatter(false);
  }
}
