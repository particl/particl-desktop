import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { timer } from 'rxjs';
import { filter, map, flatMap, distinctUntilChanged, takeWhile, take } from 'rxjs/operators';

import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { ProposalsNotificationsService } from 'app/core/market/proposals-notifier/proposals-notifications.service';
import { UserMessageService } from 'app/core/market/user-messages/user-message.service';
import { AlphaMainnetWarningComponent } from 'app/modals/alpha-mainnet-warning/alpha-mainnet-warning.component';
import { UserMessage, UserMessageType } from 'app/core/market/user-messages/user-message.model'
import { isPrerelease, isMainnetRelease } from 'app/core/util/utils';
import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { CategoryService } from 'app/core/market/api/category/category.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { ReportService } from 'app/core/market/api/report/report.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { AddToCartCacheService } from 'app/core/market/market-cache/add-to-cart-cache.service';

import * as marketConfig from '../../../../modules/market/config.js';

/*
 * The MainView is basically:
 * sidebar + router-outlet.
 * Will display the _main_ sidebar (not wallet picker)
 * and display wallet + market views.
 */
@Component({
  templateUrl: './main.router.html',
  styleUrls: ['./main.router.scss']
})
export class MainRouterComponent implements OnInit, OnDestroy {

  log: any = Log.create('main.router id: ' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  /* UI States */

  title: string = 'Overview';
  testnet: boolean = false;
  /* errors */
  daemonRunning: boolean = undefined;
  daemonError: any;
  /* version */
  daemonVersion: string;
  unSubscribeTimer: any;
  time: string = '5:00';
  showAnnouncements: boolean = false;
  public unlocked_until: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _rpcState: RpcStateService,
    private _rpc: RpcService,
    private _modalsService: ModalsHelperService,
    private messagesService: UserMessageService,
    private dialog: MatDialog,
    // the following imports are just 'hooks' to
    // get the singleton up and running
    public proposalsNotificationsService: ProposalsNotificationsService,
    public _market: MarketService,

    private _marketState: MarketStateService,
    private _profile: ProfileService,
    private _cart: CartService,
    private _category: CategoryService,
    private _favorite: FavoritesService,
    private _report: ReportService,
    private _proposal: ProposalsService,
    private _addToCart: AddToCartCacheService
  ) {
    this.log.d('Main.Router constructed');

    if ((marketConfig.allowedWallets || []).includes(this._rpc.wallet)) {
      // We recheck if the market is started here for live reload cases, and to start the various MP services
      this._market.startMarket(this._rpc.wallet).subscribe(
        () => {
          this._marketState.start();
          this._profile.start();
          this._cart.start();
          this._category.start();
          this._favorite.start();
          this._report.start();
          this._proposal.start();
          this._addToCart.start();
        }
      );
    }
  }

  ngOnInit() {
    this._rpcState.start();
    // Change the header title derived from route data
    // Source: https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this._route))
      .pipe(map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }))
      .pipe(filter(route => route.outlet === 'primary'))
      .pipe(flatMap(route => route.data))
      .subscribe(data => (this.title = data['title']));

    /* errors */
    // Updates the error box in the sidenav whenever a stateCall returns an error.
    this._rpcState.errorsStateCall.asObservable()
      .pipe(distinctUntilChanged())
      .subscribe(update => {
        // if error exists & != false
        if (update.error) {
          this.daemonRunning = ![0, 502].includes(update.error.status);
          this.daemonError = update.error;
          this.log.d(update.error);
        } else {
          this.daemonRunning = true;
        }
      });

    this._rpcState.observe('getwalletinfo', 'unlocked_until')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(status => {
        this.unlocked_until = status;
        if (this.unlocked_until > 0) {
          this.checkTimeDiff(status);
        } else {
          if (this.unSubscribeTimer) {
            this.unSubscribeTimer.unsubscribe();
          }
        }
      });

    /* versions */
    // Obtains the current daemon version
    this._rpcState.observe('getnetworkinfo', 'subversion')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(subversion => this.daemonVersion = subversion.match(/\d+\.\d+.\d+.\d+/)[0]);

    /* check if testnet -> block explorer url */
    this._rpcState.observe('getblockchaininfo', 'chain').pipe(take(1))
      .subscribe(chain => this.testnet = chain === 'test');

    this.messagesService.message.subscribe((message) => {
      if (message) {
        this.showAnnouncements = true;
      }
    });

    // TODO - find better location to perform this check...
    if (isMainnetRelease() && isPrerelease()) {
      const alphaMessage = {
        text: 'The Particl Marketplace alpha is still in development and not 100% private yet - use it at your own risk!',
        dismissable: false,
        timeout: 0,
        messageType: UserMessageType.ALERT,
        action: () => { this.dialog.open(AlphaMainnetWarningComponent); },
        actionLabel: 'Click here to read all the details first!'
      } as UserMessage;
      this.messagesService.addMessage(alphaMessage);
    }

  }

  ngOnDestroy() {
    this.destroyed = true;
    this._rpcState.stop();

    if (this._market.isMarketStarted) {
      this._market.stopMarket();
      this._profile.stop();
      this._marketState.stop();
      this._cart.stop();
      this._category.stop();
      this._favorite.stop();
      this._report.stop();
      this._proposal.stop();
      this._addToCart.stop();
    }
  }

  /** Open syncingdialog modal when clicking on progresbar in sidenav */
  syncScreen() {
    this._modalsService.syncing();
  }

  checkTimeDiff(time: number) {
    const currentUtcTimeStamp = Math.floor((new Date()).getTime() / 1000);
    const diff = Math.floor(time - currentUtcTimeStamp);
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const sec = Math.ceil((diff % (60 * 60) % 60));
    this.startTimer(minutes, sec);
  }

  startTimer(min: number, sec: number): void {
    sec = this.checkSecond(sec);
    if (sec === 59) {
      min = min - 1;
    }
    if (min >= 0 && sec >= 0) {
      this.time = min + ':' + ('0' + sec).slice(-2);
      this.unSubscribeTimer = timer(1000).
        subscribe(() => this.startTimer(min, sec));
    } else {
      this.unSubscribeTimer.unsubscribe();
    }
  }

  checkSecond(sec: number): number {
    sec = sec > 0 ? (sec - 1) : 59;
    return sec;
  }

  // Paste Event Handle
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.metaKey && event.keyCode === 86 && navigator.platform.indexOf('Mac') > -1) {
      document.execCommand('Paste');
      event.preventDefault();
    }
  }
}
