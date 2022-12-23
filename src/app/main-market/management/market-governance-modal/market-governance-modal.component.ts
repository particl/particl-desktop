import { Component, OnInit, Inject, OnDestroy  } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, merge, of } from 'rxjs';
import { tap, takeUntil, catchError } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { Particl } from 'app/networks/networks.module';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../management.service';
import { isBasicObjectType, getValueOrDefault } from '../../shared/utils';
import { GovernanceActions } from '../management.models';


enum TextContent {
  MARKET_GOVERNANCE_LOADING_ERROR = 'An error occurred while retrieving governance information'
}


@Component({
  templateUrl: './market-governance-modal.component.html',
  styleUrls: ['./market-governance-modal.component.scss']
})
export class MarketGovernanceModalComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  currentBalance: number;
  currentIdentity: { name: string; image: string; } = {
    name: '',
    image: ''
  };

  voteKeepId: number = -1;
  voteRemoveId: number = -1;
  voteCastId: number = -1;
  proposalHash: string = '';

  readonly GovernanceActions: typeof GovernanceActions = GovernanceActions;


  private destroy$: Subject<void> = new Subject();
  private marketId: number = 0;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _dialogRef: MatDialogRef<MarketGovernanceModalComponent>,
    private _store: Store,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService
  ) {
    if (isBasicObjectType(data) && (+data.marketId > 0)) {
      this.marketId = +data.marketId;
    }
  }


  ngOnInit() {
    if (this.marketId <= 0) {
      this._snackbar.open(TextContent.MARKET_GOVERNANCE_LOADING_ERROR, 'warn');
      this._dialogRef.close();
      return;
    }

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {
        this.currentIdentity.name = identity.displayName;
        this.currentIdentity.image = identity.displayName[0].toLocaleUpperCase();
      }),
      takeUntil(this.destroy$)
    );

    const balanceChange$ = this._store.select(Particl.State.Wallet.Balance.spendableAmountPublic()).pipe(
      tap((amount) => this.currentBalance = +amount || 0),
      takeUntil(this.destroy$)
    );

    const initLoad$ = this._manageService.fetchMarketGovernanceDetails(this.marketId).pipe(
      tap(info => {
        this.proposalHash = info.proposalHash;
        this.voteKeepId = getValueOrDefault(info.voteKeepId, 'number', this.voteKeepId) >= 0 ?
            info.voteKeepId : this.voteKeepId;
        this.voteRemoveId = getValueOrDefault(info.voteRemoveId, 'number', this.voteRemoveId) >= 0 ?
            info.voteRemoveId : this.voteRemoveId;
        this.voteCastId = getValueOrDefault(info.voteCastId, 'number', this.voteCastId) >= 0 ?
            info.voteCastId : this.voteCastId;
        this.isLoading = false;
      }),
      catchError(err => {
        this._snackbar.open(TextContent.MARKET_GOVERNANCE_LOADING_ERROR, 'warn');
        this._dialogRef.close();
        return of(null);
      })
    );

    merge(
      identityChange$,
      balanceChange$,
      initLoad$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  doAction(action: GovernanceActions) {
    const voteCast = action === GovernanceActions.VOTE_KEEP ?
        this.voteKeepId :
        (action === GovernanceActions.VOTE_REMOVE ? this.voteRemoveId : this.voteCastId);

    this._dialogRef.close({
      action,
      voteCast,
      proposalHash: this.proposalHash,
      marketId: this.marketId
    });
  }
}
