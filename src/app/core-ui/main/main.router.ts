import { Component, OnInit, OnDestroy, HostListener, NgModuleRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, ParamMap } from '@angular/router';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { MainModule } from 'app/core-ui/main/main.module';

import { RpcService, RpcStateService } from '../../core/rpc/rpc.module';
import { NewTxNotifierService } from 'app/core/rpc/rpc.module';
import { ModalsHelperService } from 'app/modals/modals.module';

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

  log: any = Log.create('main.router');
  private destroyed: boolean = false;

  /* UI States */

  title: string = 'Overview';
  testnet: boolean = false;
  /* errors */
  walletInitialized: boolean = undefined;
  daemonRunning: boolean = undefined;
  daemonError: any;
  /* version */
  daemonVersion: string;
  clientVersion: string = environment.version;
  marketVersion: string = environment.marketVersion;
  unSubscribeTimer: any;
  time: string = '5:00';
  public unlocked_until: number = 0;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private main: NgModuleRef<MainModule>,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _modalsService: ModalsHelperService,
    // the following imports are just 'hooks' to
    // get the singleton up and running
     private _newtxnotifier: NewTxNotifierService
  ) { 
  }

  ngOnDestroy() {
    this.destroyed = true;

    // This component only gets destroyed when changing wallets.
    // Destroys the whole main module and all the underlying services:
    // destroys modals, rpc services, rpc state services, ..
    // ModalsModule, CoreModule, etc..

    try {
      this.main.destroy();
    } catch(e) {
      this.log.e('Main module was already destroyed!')
    }

  }

  ngOnInit() {
    // Change the header title derived from route data
    // Source: https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this._route)
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .flatMap(route => route.data)
      .subscribe(data => this.title = data['title']);


    /* errors */
    // Updates the error box in the sidenav whenever a stateCall returns an error.
    this._rpcState.errorsStateCall.asObservable()
      .distinctUntilChanged()
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

    // Updates the error box in the sidenav if wallet is not initialized.
    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.walletInitialized = status);


    this._rpcState.observe('getwalletinfo', 'unlocked_until')
      .takeWhile(() => !this.destroyed)
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
      .takeWhile(() => !this.destroyed)
      .subscribe(subversion => this.daemonVersion = subversion.match(/\d+\.\d+.\d+.\d+/)[0]);

    /* check if testnet -> block explorer url */
    this._rpcState.observe('getblockchaininfo', 'chain').take(1)
      .subscribe(chain => this.testnet = chain === 'test');

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
      this.unSubscribeTimer = Observable.timer(1000).
        subscribe(() => this.startTimer(min, sec));
    } else {
      this.unSubscribeTimer.unsubscribe();
    }
  }

  checkSecond(sec: number): number {
    sec = sec > 0 ? (sec - 1) : 59;
    return sec;
  }

  get wallet() {
    return this._rpc.wallet;
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
