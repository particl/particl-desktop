import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, fromEvent, iif, defer, of, merge, forkJoin } from 'rxjs';
import { map, filter, tap, takeUntil, distinctUntilChanged, concatMap } from 'rxjs/operators';
import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { BackendService } from 'app/core/services/backend.service';
import { Particl, ParticlWalletService } from 'app/networks/networks.module';
import { NetworkInitService } from '../services/network-init/network-init.service';


/*
 * The MainView is basically:
 * sidebar (optional) +
 * router-outlet
 *
 * Its primary purpose is a shell for rendering of the base main view options.
 */
@Component({
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  showAppSelector: boolean = true;

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _actions: Actions,
    private _backendService: BackendService,
    private _networkInitService: NetworkInitService,
    private _particlWalletService: ParticlWalletService,
  ) { }

  ngOnInit() {

    this._networkInitService.requestInitializeNetworks();

    merge(
      // load Particl last active wallet once the Particl blockchain is running
      this._store.select(Particl.State.Core.isRunning()).pipe(
        distinctUntilChanged(),
        concatMap(isRunning => iif(
          () => isRunning,
          defer(() =>
            // fetch the last wallet loaded from the backend and a list of wallets available
            forkJoin({
              lastUsedWallet: this._backendService.sendAndWait<string | null>('apps:particl-wallet:lastActiveWallet'),
              walletList: this._particlWalletService.getWalletList()
            }).pipe(
              map(responses => {
                let walletName = responses.lastUsedWallet || '';
                const lastUsedValidWallet = responses.walletList.wallets.map(w => w.name).find(wName => wName === responses.lastUsedWallet);
                if ((lastUsedValidWallet === undefined) && (responses.walletList.wallets.length > 0)) {
                  walletName = responses.walletList.wallets[0].name;
                }
                return walletName;
              }),
              concatMap(walletName => {
                const toLoadName = typeof walletName === 'string' ? walletName : '';

                return this._store.dispatch(new Particl.Actions.WalletActions.ChangeWallet(toLoadName)).pipe(
                  concatMap(() => {
                    // check that the wallet loaded is the same as the requested
                    const loadedName = this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('walletname'));
                    if (loadedName !== toLoadName) {
                      // loaded wallet doesn't match, so fallback to whatever the first current loaded wallet is
                      return this._particlWalletService.listLoadedWallets().pipe(
                        tap({
                          next: loadedWallets => {
                            if (Array.isArray(loadedWallets) && loadedWallets.length > 0) {
                              this._store.dispatch(new Particl.Actions.WalletActions.ChangeWallet(loadedWallets[0]));
                            }
                          }
                        })
                      );
                    }
                    return of({});
                  })
                );
              })
            )
          )
        )),
        takeUntil(this.destroy$)
      ),

      // set the last active Particl wallet when the wallet is changed
      this._actions.pipe(ofActionCompleted(Particl.Actions.WalletActions.ChangeWallet)).pipe(
        tap({
          next: () => {
            const walletName = this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('walletname'));
            this._backendService.send('apps:particl-wallet:setActiveWallet', walletName);
          }
        }),
        takeUntil(this.destroy$)
      )
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }


  ngAfterViewInit() {
    // @TODO zaSmilingIdiot 2020-02-28 -> is this really still necessary,
    //    particularly now that we have paste functionality on the Mac via the inclusion of the shortcut keys in Electron?
    // Paste Event Handle: using rxjs's fromEvent instead of HostListener
    // Prevents Angular change detection running for each event (whether the event handled or not) when using HostListener
    fromEvent(document, 'keydown').pipe(
      map((event: KeyboardEvent) => {
        if (event.metaKey && event.keyCode === 86 && navigator.platform.indexOf('Mac') > -1) {
          event.preventDefault();
          return true;
        }
        return false;
      }),
      filter(Boolean),
      tap(() => document.execCommand('Paste')),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
