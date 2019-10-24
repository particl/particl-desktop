import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { BotService } from 'app/core/bot/bot.module';
import { Bot } from 'app/core/bot/bot.model';

interface IPage {
  pageNumber: number,
  bots: Array<any>;
}

@Component({
  selector: 'app-bot-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;

  public isLoading: boolean = false; // small progress bars
  public isLoadingBig: boolean = true; // big animation
  public noMoreListings: boolean = false;

  private botServiceSubcription: Subscription;

  pages: Array<IPage> = [];

  pagination: any = {
    maxPerPage: 24,
    infinityScrollSelector: '.mat-drawer-content'
  };

  constructor(
    private readonly botService: BotService
  ) {}

  ngOnInit() {
    this.loadPage(0, true);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  private async loadPage(pageNumber: number, clear: boolean) {
    // set loading aninmation
    this.isLoading = true;

    // params
    const max = this.pagination.maxPerPage;
    
    try{
      const bots: Array<Bot> = await this.botService.search(pageNumber, max, '', '', null);

      this.isLoading = false;
      this.isLoadingBig = false;

      const page = {
        pageNumber: pageNumber,
        bots: bots
      };

      // should we clear all existing pages? e.g search
      if (clear === true) {
        this.pages = [page];
        this.noMoreListings = false;
      } else { // infinite scroll
        this.pages.push(page);

        if (bots.length < max) {
          this.noMoreListings = true;
        }
      }

      if (bots.length > 0) {
        setTimeout(() => this.checkIfShouldLoadMore(), 500);
      }
    } catch (e) {
      setTimeout(() => {
        if (!this.destroyed) {
          this.loadPage(pageNumber, clear);
        }
      }, 5000);
    }
  }

  loadNextPage() {
    if (this.pages.length) {
      let nextPage = this.pages[this.pages.length - 1].pageNumber;
      nextPage++;
      this.loadPage(nextPage, false);
    }
  }

  private checkIfShouldLoadMore() {
    const scrollContainer = document.querySelector(this.pagination.infinityScrollSelector);
    // If the scroll bar isn't showing, try load another page
    if (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
      this.loadNextPage();
    }
  }

}
