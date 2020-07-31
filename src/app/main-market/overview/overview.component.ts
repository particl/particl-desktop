import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, concat } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { WalletUTXOState, WalletInfoState } from 'app/main/store/main.state';
import { Identity } from '../store/market.models';
import { WalletUTXOStateModel, PublicUTXO, AnonUTXO, WalletInfoStateModel } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';


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
}


@Component({
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {

  @Select(MarketState.currentIdentity) currentIdentity: Observable<Identity>;

  readonly listingsUrl: string;
  readonly buyerActions: ActionableItem[];
  readonly sellerActions: ActionableItem[];

  readonly balances: Balances = {
    spendableAnon: {whole: '0', sep: '', decimal: ''},
    pendingAnon: {whole: '0', sep: '', decimal: '', value: 0},
    spendablePublic: {whole: '0', sep: '', decimal: ''},
    pendingPublic: {whole: '0', sep: '', decimal: '', value: 0},
  };


  private destroy$: Subject<void> = new Subject();


  constructor(
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {

    // Define the actionable items...
    const ACTIONABLES: ActionableItem[] = [
      {
        title: 'Active Buy Orders', text: 'All Buy Orders currently in progress',
        icon: 'part-recipe', active: false, count: 0, component: 'buy', key: 'buy-orders-active', category: 'buy',
        url: '', urlParams: {} },
      { title: 'Urgent Buy Orders', text: 'Updated Orders that need your attention',
        icon: 'part-recipe', active: false, count: 0, component: 'buy', key: 'buy-orders-urgent', category: 'buy',
        url: '', urlParams: {} },
      { title: 'New replies', text: 'Unread Sellers\' replies to your questions',
        icon: 'part-chat-discussion', active: false, count: 0, component: 'buy', key: 'buy-questions', category: 'buy',
        url: '', urlParams: {} },
      { title: 'Joined Markets', text: 'Total number of Markets you\'ve joined',
        icon: 'part-shop', active: false, count: 0, component: 'buy', key: 'buy-markets', category: 'buy',
        url: '', urlParams: {} },

      {
        title: 'Active Sell Orders', text: 'All Sell Orders currently in progress',
        icon: 'part-recipe', active: true, count: 0, component: 'sell', key: 'sell-orders-active', category: 'sell',
        url: '', urlParams: {selectedSellTab: 'orders'} },
      {
        title: 'Urgent Sell Orders', text: 'Updated Orders that need your attention',
        icon: 'part-recipe', active: true, count: 0, component: 'sell', key: 'sell-orders-urgent', category: 'sell',
        url: '', urlParams: {selectedSellTab: 'orders'} },
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


    concat(
      spendable$,
      pending$
    ).pipe(
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


  extractUTXOSpendable(utxos: PublicUTXO[] | AnonUTXO[]): PartoshiAmount {
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

}
