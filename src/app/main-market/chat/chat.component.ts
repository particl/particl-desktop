import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';


interface ChatTab {
  icon: string;
  title: string;
  templ: string;
  notificationValue: any;
}


@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {

  readonly tabs: ChatTab[] = [
    { title: 'Messages', icon: 'part-chat-discussion', templ: 'chats', notificationValue: null},
    { title: 'Participants', icon: 'part-person', templ: 'users', notificationValue: null}
  ];


  private selectedTabIdx: number = 0;
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _store: Store
  ) { }


  ngOnInit() {
    merge(
      this._route.queryParams.pipe(
        map(params => params['selectedBuyTab']),
        tap((selectedBuyTab: string | undefined) => {
          if (selectedBuyTab) {
            const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedBuyTab);
            if (newTabIdx > -1) {
              this.selectedTabIdx = newTabIdx;
            }
            this._cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.chatUnreadCountNotification('all')).pipe(
        tap((value) => {
          const foundTab = this.tabs.find(t => t.templ === 'chats');
          if (foundTab) {
            foundTab.notificationValue = +value > 0 ? +value : null;
            this._cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      ),
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get selectedTab(): number {
    return this.selectedTabIdx;
  }

  get selectedTempl(): string {
    return this.tabs[this.selectedTabIdx].templ;
  }


  changeTab(idx: number) {
    if ((idx !== this.selectedTabIdx) && (idx >= 0) && (idx < this.tabs.length)) {
      this.selectedTabIdx = idx;
    }
  }

}
