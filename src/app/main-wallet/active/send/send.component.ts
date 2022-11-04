import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Subject, merge, defer, iif } from 'rxjs';
import { takeUntil, tap, startWith, concatMap, take, finalize } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { WalletSettingsState } from '../../shared/state-store/wallet-store.state';
import { SendService } from './send.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SendConfirmationModalComponent } from './send-confirmation-modal/send-confirmation-modal.component';
import { CoinControlModalComponent, CoinControlModalData } from './coin-control-modal/coin-control-modal.component';
import { AddressLookupModalComponent } from './addresss-lookup-modal/address-lookup-modal.component';
import { targetTypeValidator, amountRangeValidator, ValidAddressValidator, publicAddressUsageValidator } from './send.validators';
import {
  TabType,
  TxTypeOption,
  TabModel,
  SavedAddress,
  SendTransaction,
} from './send.models';
import { RPCResponses, MIN_RING_SIZE, MAX_RING_SIZE, DEFAULT_RING_SIZE, MIN_UTXO_SPLIT, MAX_UTXO_SPLIT, DEFAULT_UTXO_SPLIT } from 'app/networks/particl/particl.models';
import { Particl } from 'app/networks/networks.module';
import { PartoshiAmount } from 'app/core/util/utils';


enum TextContent {
  LOW_BALANCE_HELP = 'It is normal to have a very small balance in Blind even after transferring out everything. This is due to the way CT works and part of the privacy platform.',
  ESTIMATE_ERROR = 'Could not accurately estimate this transaction fee. Please try again',
  SEND_SUCCESS = 'Successfully sent ${amount} PART to ${address}',
  SEND_FAILURE = 'Failed creating the transaction, please try again later',
  TRANSFER_SUCCESS = 'Successfully transferred ${amount} PART',
  PAY_FEE_ERROR = 'The transaction amount is too small to pay the fee',
  STEALTH_ADDRESS_ERROR = 'Stealth address required for private transactions!'
}


@Component({
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
  providers: [ SendService, ValidAddressValidator ]
})
export class SendComponent implements OnInit, OnDestroy {

  showAdvanced: boolean = false;
  selectedTab: FormControl = new FormControl(0);
  sourceType: FormControl = new FormControl('part');
  targetForm: FormGroup;

  readonly minSplitUTXO: number = MIN_UTXO_SPLIT;
  readonly maxSplitUTXO: number = MAX_UTXO_SPLIT;
  readonly defaultSplitUTXO: number;

  readonly minRingSize: number = MIN_RING_SIZE;
  readonly maxRingSize: number = MAX_RING_SIZE;
  readonly defaultRingSize: number;

  readonly tabs: TabModel[] = [
    { icon: 'part-send', type: 'send', title: 'Send payment'},
    { icon: 'part-transfer', type: 'transfer', title: 'Convert Public & Private'},
  ];

  readonly selectorOptions: TxTypeOption[] = [
    { name: 'Public', balance: 0, coinInputs: [], displayedBalance: '0', value: 'part', help: '', description: 'Used for publishing of Listings and governance voting (on Listings and Proposals)', color: 'primary' },
    { name: 'Blind', balance: 0, coinInputs: [], displayedBalance: '0', value: 'blind', help: '', description: 'Offers medium privacy, hides transaction amounts', color: 'accent' },
    { name: 'Anon', balance: 0, coinInputs: [], displayedBalance: '0', value: 'anon',
      help: '', description: 'Offers the highest privacy', color: 'accent'}
  ];

  private destroy$: Subject<void> = new Subject();
  private log: any = Log.create('send.component');
  private isProcessing: boolean = true;
  private altBalanceTrigger: FormControl = new FormControl(0);
  private addressCheckTrigger: FormControl = new FormControl();


  constructor(
    private route: ActivatedRoute,
    private _sendService: SendService,
    private _unlocker: WalletEncryptionService,
    private _snackbar: SnackbarService,
    private _addressValidator: ValidAddressValidator,
    private _dialog: MatDialog,
    private _store: Store,
  ) {
    this.defaultRingSize = this._store.selectSnapshot(WalletSettingsState.settings).default_ringct_size || DEFAULT_RING_SIZE;
    this.defaultSplitUTXO = this._store.selectSnapshot(WalletSettingsState.settings).utxo_split_count || DEFAULT_UTXO_SPLIT;
  }


  ngOnInit() {
    this.targetForm = new FormGroup({
      ringSize: new FormControl(this.defaultRingSize, [Validators.min(this.minRingSize), Validators.max(this.maxRingSize)]),
      selectedUTXOCount: new FormControl(this.defaultSplitUTXO, [Validators.min(this.minSplitUTXO), Validators.max(this.maxSplitUTXO)]),
      targetType: new FormControl('blind', targetTypeValidator(this.currentTabType, this.sourceType.value)),
      address: new FormControl('',
        publicAddressUsageValidator(this.currentTabType, this.sourceType.value),
        this._addressValidator.validate.bind(this._addressValidator)
      ),
      addressLabel: new FormControl(''),
      narration: new FormControl('', [Validators.maxLength(24)]),
      amount: new FormControl({value: '', disabled: false}, amountRangeValidator(this.selectedSourceSelector().balance)),
      isSendAll: new FormControl(false)
    });

    // Use query params to set initial values if an appropriate queryParam has been provided
    const paramsMap = this.route.snapshot.queryParamMap;
    const amountParam = +paramsMap.get('amount') || 0;
    const convert = paramsMap.get('convertTarget');
    let tab = (paramsMap.get('tab') || '') as TabType;

    this.amount.setValue(amountParam || '');

    if (convert) {
      tab = 'transfer';
      this.targetType.setValue(convert);
    }

    if (tab) {
      const  tabIdx = this.tabs.findIndex((t) => t.type === tab);
      if (tabIdx > -1) {
        this.selectedTab.setValue(tabIdx);
      }
    }

    // Event handling:

    const amount$ = defer(() => {
      const selector = this.selectedSourceSelector();
      const dispBal = selector.displayedBalance;

      const bal = (new PartoshiAmount(+dispBal)).particls();

      if (this.sendingAll.value) {
        this.amount.setValue(bal);
      }

      this.amount.setValidators(amountRangeValidator(bal));
      this.amount.updateValueAndValidity();
    });

    const sourceType$ = this.sourceType.valueChanges.pipe(
      tap((newValue) => {
        this.selectorOptions.forEach(s => s.coinInputs = []);

        if (newValue === this.targetType.value) {
          this.targetType.setValue(this.selectorOptions.find(opt => opt.value !== newValue).value);
        }
        this.targetType.setValidators(targetTypeValidator(this.currentTabType, this.sourceType.value));
        this.targetType.updateValueAndValidity();
        this.addressCheckTrigger.setValue(null);
      }),
      takeUntil(this.destroy$)
    );

    const balances$ = this._sendService.getBalances(this.destroy$).pipe(
      tap((result) => {
        this.selectorOptions.forEach(o => {
          o.balance = typeof result[o.value] === 'number' ? result[o.value] : o.balance;

          if (o.value === 'blind') {
            if ((o.balance > 0) && (o.balance < 0.0001)) {
              o.help = TextContent.LOW_BALANCE_HELP;
            } else if (o.help.length > 0) {
              o.help = '';
            }
          }
        });
      }),
      startWith({part: 0, blind: 0, anon: 0}),
      takeUntil(this.destroy$)
    );

    // force recalculation of amounts
    const altBalance$ = this.altBalanceTrigger.valueChanges.pipe(
      takeUntil(this.destroy$)
    );

    const amountValid$ = merge(
      sourceType$,
      altBalance$,
      balances$
    ).pipe(
      tap(() => {
        // set the displayed balance for each option
        this.selectorOptions.forEach(o => {
          const balance = new PartoshiAmount(0);
          if (o.coinInputs.length > 0) {
            for (const input of o.coinInputs) {
              balance.add(new PartoshiAmount(input.amount));
            }
          } else {
            balance.add(new PartoshiAmount(o.balance));
          }
          o.displayedBalance = balance.particlsString();
        });
      }),
      concatMap(() => amount$),
      takeUntil(this.destroy$)
    );

    const switcher$ = this.selectedTab.valueChanges.pipe(
      tap(() => {
        this.currentTabType === 'send' ? this.address.enable() : this.address.disable();
        this.addressCheckTrigger.setValue(null);
      }),
      takeUntil(this.destroy$)
    );


    const addressValidtor$ = this.addressCheckTrigger.valueChanges.pipe(
      tap(() => {
        this.address.setValidators(publicAddressUsageValidator(this.currentTabType, this.sourceType.value));
        this.address.updateValueAndValidity();
      }),
      takeUntil(this.destroy$)
    );

    const sendingAll$ = this.sendingAll.valueChanges.pipe(
      tap((newValue: boolean) => {
        if (newValue) {
          this.amount.disable();
          const selector = this.selectedSourceSelector();
          const dispBal = selector.displayedBalance;

          const bal = (new PartoshiAmount(+dispBal)).particls();

          this.amount.setValue(bal);
        } else if (this.amount.disabled) {
          this.amount.enable();
        }
      }),
      takeUntil(this.destroy$)
    );

    merge(
      amountValid$,
      switcher$,
      addressValidtor$,
      sendingAll$
    ).subscribe();

    this.isProcessing = false;
  }


  get ringSize(): AbstractControl {
    return this.targetForm.get('ringSize');
  }

  get selectedUTXOCount(): AbstractControl {
    return this.targetForm.get('selectedUTXOCount');
  }

  get targetType(): AbstractControl {
    return this.targetForm.get('targetType');
  }

  get address(): AbstractControl {
    return this.targetForm.get('address');
  }

  get addressLabel(): AbstractControl {
    return this.targetForm.get('addressLabel');
  }

  get narration(): AbstractControl {
    return this.targetForm.get('narration');
  }

  get amount(): AbstractControl {
    return this.targetForm.get('amount');
  }

  get sendingAll(): AbstractControl {
    return this.targetForm.get('isSendAll');
  }

  get currentTabType(): TabType {
    return this.tabs[this.selectedTab.value].type;
  }

  get canBeProcessing(): boolean {
    return this.isProcessing;
  }


  get hasCoinControlSelected(): boolean {
    return ((this.selectedSourceSelector() || {} as any).coinInputs || []).length > 0;
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openAddressLookup(): void {
    const dialog = this._dialog.open(AddressLookupModalComponent);
    dialog.componentInstance.addressSelected.pipe(take(1)).subscribe(
      (value: SavedAddress) => {
        if (value && value.address) {
          this.address.setValue(value.address);
        }
        if (value && value.label) {
          this.addressLabel.setValue(value.label);
        }
      }
    );
    dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.addressSelected.unsubscribe());
  }

  openCoinControlModal(): void {
    const initSelection = this.sourceType.value;

    const dialogData: CoinControlModalData = {
      selected: (this.selectedSourceSelector().coinInputs || []).map(utxo => ({txid: utxo.tx, vout: utxo.n})),
      txType: this.sourceType.value === 'part' ? 'public' : this.sourceType.value
    };

    this._dialog.open(CoinControlModalComponent, {
      data: dialogData
    }).afterClosed().pipe(
      take(1),
      tap((utxos) => {
        if (Array.isArray(utxos)) {

          const utxosSelected: {tx: string, n: number, amount: number}[] = [];

          utxos.forEach((u: any) => {
            if (u && Object.prototype.toString.call(u) === '[object Object]') {
              if ((typeof u.txid === 'string') && (typeof u.vout === 'number') && (typeof u.amount === 'number')) {
                utxosSelected.push({tx: u.txid, n: u.vout, amount: u.amount});
              }
            }
          });

          const selector = this.selectorOptions.find(s => s.value === initSelection);
          if (selector) {
            selector.coinInputs = utxosSelected;
          }
          this.altBalanceTrigger.setValue(null);
        }
      }),
    ).subscribe();
  }


  clearSendInputs(): void {
    this.address.setValue('');
    this.addressLabel.setValue('');
  }


  onSubmit() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    const selector = this.selectedSourceSelector();

    const trans = new SendTransaction();
    trans.transactionType = this.currentTabType;
    trans.source = this.sourceType.value;
    trans.targetTransfer = this.targetType.value;
    trans.amount = +this.amount.value;
    trans.narration = this.narration.value || '';
    trans.ringSize = this.ringSize.value;
    trans.utxoCount = this.selectedUTXOCount.value;
    trans.deductFeesFromTotal = this.sendingAll.value;
    trans.addressLabel = trans.transactionType === 'send' ? this.addressLabel.value : '';
    trans.targetAddress = trans.transactionType === 'send' ? this.address.value : '';

    if (selector && (selector.coinInputs.length > 0)) {

      trans.coinControl.inputs = selector.coinInputs.map(u => ({tx: u.tx, n: u.n}));

      if (trans.deductFeesFromTotal && (selector.coinInputs.map(u => u.amount).reduce((acc, val) => acc + val, 0) < selector.balance) ) {
        trans.deductFeesFromTotal = false;
      }
    }

    this._unlocker.unlock({timeout: 15}).pipe(
      finalize(() => this.isProcessing = false),
      concatMap((unlocked: boolean) => iif(() => unlocked, defer(() => this._sendService.runTransaction(trans, true))))
    ).subscribe(
      (result: RPCResponses.SendTypeTo) => {
        const dialog = this._dialog.open(SendConfirmationModalComponent, {data: {sendTx: trans, fee: result.fee}});
        dialog.componentInstance.isConfirmed.pipe(
          take(1),
          concatMap(() => this._unlocker.unlock({timeout: 5}).pipe(
            concatMap((unlocked) => iif(() => unlocked, defer(() => this._sendService.runTransaction(trans, false))))
          ))
        ).subscribe(
          () => {
            // request new balances
            this._store.dispatch(new Particl.Actions.WalletActions.RefreshBalances());

            // present success message
            const trimAddress = trans.targetAddress.substring(0, 16) + '...';
            const displayAmount = this.amount.value;
            const text = this.selectedTab.value === 'send' ?
              TextContent.SEND_SUCCESS.replace('${amount}', displayAmount).replace('${address}', trimAddress) :
              TextContent.TRANSFER_SUCCESS.replace('${amount}', displayAmount);

            // reset relevant input fields
            selector.coinInputs = [];
            this.amount.reset('');
            this.address.reset('');
            this.addressLabel.reset('');
            this.narration.reset('');
            this.sendingAll.reset(false);

            this._snackbar.open(text, 'success');
          },
          (err) => {
            this.log.er('sending failed: ', err);
            this._snackbar.open(TextContent.SEND_FAILURE);
          }
        );
        dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.isConfirmed.unsubscribe());
      },

      (err: RPCResponses.Error) => {
        this.log.er('estimation failed: ', err);
        const errorMessage = err.message || '';
        let text: string;

        switch (true) {
          case errorMessage.includes('amount is too small to pay the fee'):
            text = TextContent.PAY_FEE_ERROR;
            break;
          default:
            text = TextContent.ESTIMATE_ERROR;
        }
        this._snackbar.open(text, 'err');
      }
    );
  }


  private selectedSourceSelector(): TxTypeOption {
    return this.selectorOptions.find(opt => opt.value === this.sourceType.value);
  }
}
