import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject, Observable, merge, iif, of, defer } from 'rxjs';
import { takeUntil, tap, auditTime, switchMap, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { WalletUTXOState, WalletInfoState } from 'app/main/store/main.state';

import { OverviewService } from './overview.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { WalletUTXOStateModel, PublicUTXO, AnonUTXO, WalletInfoStateModel } from 'app/main/store/main.models';


type ComponentType = 'buy' | 'sell';
type ActionableCategory = 'buy' | 'sell';

interface ActionableItem {
  key: string;  // unique identifier to identify which badge needs to be updated
  title: string;
  text: string;
  active: boolean;
  icon: string;
  count: number;
  component: ComponentType;
  category: ActionableCategory;
  url: string;
  urlParams?: {[key: string]: string};
}

interface Balances {
  spendableAnon: {whole: string, sep: string, decimal: string};
  pendingAnon: {whole: string, sep: string, decimal: string, value: number};
  spendablePublic: {whole: string, sep: string, decimal: string};
  pendingPublic: {whole: string, sep: string, decimal: string, value: number};
  escrowLocked: {whole: string, sep: string, decimal: string};
}


@Component({
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [OverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {

  identityDisplayName: string = '';
  isAnonFeeBalance: boolean;

  readonly listingsUrl: string;
  readonly buyerActions: ActionableItem[];
  readonly sellerActions: ActionableItem[];

  readonly balances: Balances = {
    spendableAnon: {whole: '0', sep: '', decimal: ''},
    pendingAnon: {whole: '0', sep: '', decimal: '', value: 0},
    spendablePublic: {whole: '0', sep: '', decimal: ''},
    pendingPublic: {whole: '0', sep: '', decimal: '', value: 0},
    escrowLocked: {whole: '0', sep: '', decimal: ''},
  };


  private destroy$: Subject<void> = new Subject();
  private updateTriggerControl: FormControl = new FormControl();

  private readonly resetData$: Observable<any> = of({}).pipe(
    tap(() => {
      this.balances.escrowLocked = {
        whole: '0',
        sep: '',
        decimal: ''
      };

      this.buyerActions.forEach(act => {
        act.count = 0;
        act.active = false;
      });
      this.sellerActions.forEach(act => {
        act.count = 0;
        act.active = false;
      });
    })
  );


  constructor(
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _overviewService: OverviewService
  ) {

    // Define the actionable items...
    const ACTIONABLES: ActionableItem[] = [
      {
        title: 'Active Buy Orders', text: 'All Buy Orders currently in progress',
        icon: 'part-recipe', active: false, count: 0, component: 'buy', key: 'buy-orders-active', category: 'buy',
        url: '', urlParams: {selectedBuyTab: 'orders'} },
      { title: 'Urgent Buy Orders', text: 'Updated Orders that need your attention',
        icon: 'part-recipe', active: false, count: 0, component: 'buy', key: 'buy-orders-urgent', category: 'buy',
        url: '', urlParams: {selectedBuyTab: 'orders', toggleOrdersNeedingAttention: '1'} },
      { title: 'New replies', text: 'Unread Sellers\' replies to your questions',
        icon: 'part-chat-discussion', active: false, count: 0, component: 'buy', key: 'buy-questions', category: 'buy',
        url: '', urlParams: {selectedBuyTab: 'comments'} },
      { title: 'Joined Markets', text: 'Total number of Markets you\'ve joined',
        icon: 'part-shop', active: false, count: 0, component: 'buy', key: 'buy-markets', category: 'buy',
        url: '', urlParams: {selectedBuyTab: 'shipping-profiles'} },

      {
        title: 'Active Sell Orders', text: 'All Sell Orders currently in progress',
        icon: 'part-recipe', active: true, count: 0, component: 'sell', key: 'sell-orders-active', category: 'sell',
        url: '', urlParams: {selectedSellTab: 'orders'} },
      {
        title: 'Urgent Sell Orders', text: 'Updated Orders that need your attention',
        icon: 'part-recipe', active: true, count: 0, component: 'sell', key: 'sell-orders-urgent', category: 'sell',
        url: '', urlParams: {selectedSellTab: 'orders', toggleOrdersNeedingAttention: '1'} },
      {
        title: 'New questions', text: 'Unread Buyers\' questions on your Listings',
        icon: 'part-chat', active: true, count: 0, component: 'sell', key: 'sell-questions', category: 'sell',
        url: '',  urlParams: {selectedSellTab: 'questions'} },
      {
        title: 'Expired Listings', text: 'Listings needing to be re-listed on the Market',
        icon: 'part-stock', active: true, count: 0, component: 'sell', key: 'sell-listings-expired', category: 'sell',
        url: '', urlParams: {selectedSellTab: 'listings'} },
    ];

    // Build up the path to current route, minus the current component, in order to get the parent router path
    const target: string[] = [];
    const pathSegments = this._route.snapshot.pathFromRoot;
    for (const segment of pathSegments) {
      if (segment.url && (segment.url.length === 1) && segment.url[0].path) {
        target.push(segment.url[0].path);
      }
    }

    if (target.length > 0) {
      target.pop();
    }

    const parentUrl = `/${target.join('/')}`;

    for (const item of ACTIONABLES) {
      // set item routing url
      item.url = `${parentUrl}/${item.component}`;
    }

    // Handy filters for template rendering
    this.buyerActions = ACTIONABLES.filter(item => item.category === 'buy') || [];
    this.sellerActions = ACTIONABLES.filter(item => item.category === 'sell') || [];

    this.listingsUrl = `${parentUrl}/listings`;
  }


  ngOnInit() {
    const identity$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {
        this.identityDisplayName = identity.displayName;
        if (identity.id > 0) {
          this.updateTriggerControl.setValue(identity.id);
        }
      }),
      takeUntil(this.destroy$)
    );

    const updateActions$ = this.updateTriggerControl.valueChanges.pipe(
      switchMap((identityId: number) => defer(() => this.updateActionDataValues(identityId))),
      takeUntil(this.destroy$)
    );

    const spendable$ = this._store.select(WalletUTXOState).pipe(
      tap((utxos: WalletUTXOStateModel) => {
        let anonSpendable: PartoshiAmount;
        let publicSpendable: PartoshiAmount;

        if (+this._store.selectSnapshot(MarketState.currentIdentity).id > 0) {
          anonSpendable = this.extractUTXOSpendable(utxos.anon);
          publicSpendable = this.extractUTXOSpendable(utxos.public);
        } else {
          anonSpendable = new PartoshiAmount(0);
          publicSpendable = new PartoshiAmount(0);
        }
        this.balances.spendableAnon.whole = anonSpendable.particlStringInteger();
        this.balances.spendableAnon.sep = anonSpendable.particlStringSep();
        this.balances.spendableAnon.decimal = anonSpendable.particlStringFraction();

        this.balances.spendablePublic.whole = publicSpendable.particlStringInteger();
        this.balances.spendablePublic.sep = publicSpendable.particlStringSep();
        this.balances.spendablePublic.decimal = publicSpendable.particlStringFraction();
      }),
      takeUntil(this.destroy$)
    );

    const pending$ = this._store.select(WalletInfoState).pipe(
      tap((info: WalletInfoStateModel) => {
        const pendingAnon = new PartoshiAmount(0);
        const pendingPublic = new PartoshiAmount(0);

        if (+this._store.selectSnapshot(MarketState.currentIdentity).id > 0) {
          pendingAnon.add( new PartoshiAmount(+info.unconfirmed_anon) ).add( new PartoshiAmount(+info.immature_anon_balance) );
          pendingPublic.add( new PartoshiAmount(+info.unconfirmed_balance) ).add( new PartoshiAmount(+info.immature_balance) );
        }

        this.balances.pendingAnon.whole = pendingAnon.particlStringInteger();
        this.balances.pendingAnon.sep = pendingAnon.particlStringSep();
        this.balances.pendingAnon.decimal = pendingAnon.particlStringFraction();
        this.balances.pendingAnon.value = pendingAnon.particls();

        this.balances.pendingPublic.whole = pendingPublic.particlStringInteger();
        this.balances.pendingPublic.sep = pendingPublic.particlStringSep();
        this.balances.pendingPublic.decimal = pendingPublic.particlStringFraction();
        this.balances.pendingPublic.value = pendingPublic.particls();
      }),
      takeUntil(this.destroy$)
    );

    // @TODO: Implement the escrow locked balance lookup
    // @TODO: Implement the badge count queries for each item

    const settingUpdate$ = this._store.select(MarketState.settings).pipe(
      tap(marketSettings => {
        this.isAnonFeeBalance = marketSettings.useAnonBalanceForFees;
      }),
      takeUntil(this.destroy$)
    );


    merge(
      updateActions$,
      spendable$,
      pending$,
      settingUpdate$,
      identity$,
    ).pipe(
      auditTime(500),
      takeUntil(this.destroy$)
    ).subscribe(
      // force change detection to run since we've updated something here
      () => {
        this._cdr.detectChanges();
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByActionableIndex(idx: number, item: ActionableItem) {
    return item.key;
  }


  navigateTo(option: ActionableItem) {
    if (option && option.active && (typeof option.url === 'string') && (option.url.length > 0)) {
      const params = typeof option.urlParams === 'object' ? option.urlParams : {};
      this._router.navigate([option.url], {queryParams: params});
    }
  }


  private extractUTXOSpendable(utxos: PublicUTXO[] | AnonUTXO[]): PartoshiAmount {
    const tempBal = new PartoshiAmount(0);

    for (let ii = 0; ii < utxos.length; ++ii) {
      const utxo = utxos[ii];
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        const amount = new PartoshiAmount(utxo.amount);
        tempBal.add(amount);
      }
    }

    return tempBal;
  }


  private updateActionDataValues(identityId: number): Observable<any> {
    return defer(() => iif(
      () => +identityId > 0,

      // request all of the infos (and set actions as active)
      of({}).pipe(
        tap(() => this.buyerActions.forEach(act => act.active = true)),
        tap(() => this.sellerActions.forEach(act => act.active = true)),
        tap(() => this._cdr.detectChanges()),
        concatMap(() => this._overviewService.fetchDataCounts().pipe(
          tap(dataCounts => {
            if (dataCounts.orders) {
              this.updateCount('buy', 'buy-orders-active', dataCounts.orders.buyActive);
              this.updateCount('buy', 'buy-orders-urgent', dataCounts.orders.buyWaiting);
              this.updateCount('sell', 'sell-orders-active', dataCounts.orders.sellActive);
              this.updateCount('sell', 'sell-orders-urgent', dataCounts.orders.sellWaiting);

              this.balances.escrowLocked.whole = dataCounts.orders.fundsInEscrow.particlStringInteger();
              this.balances.escrowLocked.sep = dataCounts.orders.fundsInEscrow.particlStringSep();
              this.balances.escrowLocked.decimal = dataCounts.orders.fundsInEscrow.particlStringFraction();
            }

            if (dataCounts.markets) {
              this.updateCount('buy', 'buy-markets', dataCounts.markets.joinedMarkets);
            }

            if (dataCounts.listings) {
              this.updateCount('sell', 'sell-listings-expired', dataCounts.listings.expiredListings);
            }
          }),
        ))
      ),

      // reset the values to a default state since the identity is not really known
      this.resetData$
    ));
  }


  private updateCount(category: 'buy' | 'sell', key: string, value: number): void {
    const items = category === 'buy' ? this.buyerActions : this.sellerActions;
    const item = items.find(i => i.key === key);
    if (item) {
      item.count = value;
    }
  }

}
