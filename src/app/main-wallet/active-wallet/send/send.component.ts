import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Subject, merge, defer } from 'rxjs';
import { takeUntil, tap, startWith, concatMap, take } from 'rxjs/operators';
import { SendService } from './send.service';
import { TabType, TxTypeOption, TabModel, SavedAddress } from './send.models';
import { targetTypeValidator, amountRangeValidator, ValidAddressValidator } from './send.validators';
import { AddressLookupModalComponent } from './addresss-lookup-modal/address-lookup-modal.component';


enum TextContent {
  LOW_BALANCE_HELP = 'It is normal to have a very small balance in Blind even after transferring out everything. This is due to the way CT works and part of the privacy platform.'
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

  readonly minRingSize: number = 3;
  readonly maxRingSize: number = 32;

  readonly tabs: TabModel[] = [
    { icon: 'part-send', type: 'send', title: 'Send payment'},
    { icon: 'part-transfer', type: 'transfer', title: 'Convert Public & Private'},
  ];

  readonly selectorOptions: TxTypeOption[] = [
    { name: 'Public', balance: 0, displayedBalance: '0', value: 'part', help: '' },
    { name: 'Blind', balance: 0, displayedBalance: '0', value: 'blind', help: '' },
    { name: 'Anon', balance: 0, displayedBalance: '0', value: 'anon', help: '' }
  ];

  private destroy$: Subject<void> = new Subject();


  constructor(
    private route: ActivatedRoute,
    private _sendService: SendService,
    private _addressValidator: ValidAddressValidator,
    private _dialog: MatDialog,
  ) { }


  ngOnInit() {
    this.targetForm = new FormGroup({
      ringSize: new FormControl(8, [Validators.min(this.minRingSize), Validators.max(this.maxRingSize)]),
      targetType: new FormControl('blind', targetTypeValidator(this.currentTabType, this.sourceType.value)),
      address: new FormControl('', [], this._addressValidator.validate.bind(this._addressValidator)),
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
      const bal = this.selectedSourceSelector().balance;
      if (this.sendingAll.value) {
        this.amount.setValue(bal);
      }
      this.amount.setValidators(amountRangeValidator(bal));
      this.amount.updateValueAndValidity();
    });

    const sourceType$ = this.sourceType.valueChanges.pipe(
      tap((newValue) => {
        if (newValue === this.targetType.value) {
          this.targetType.setValue(this.selectorOptions.find(opt => opt.value !== newValue).value);
        }
        this.targetType.setValidators(targetTypeValidator(this.currentTabType, this.sourceType.value));
        this.targetType.updateValueAndValidity();
      }),
      takeUntil(this.destroy$)
    );

    const balances$ = this._sendService.getBalances().pipe(
      tap((result) => {
        this.selectorOptions.forEach(o => {
          o.balance = typeof result[o.value] === 'number' ? result[o.value] : o.balance;
          o.displayedBalance = `${o.balance}`;
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

    const amountValid$ = merge(
      sourceType$,
      balances$
    ).pipe(
      concatMap(() => amount$),
      takeUntil(this.destroy$)
    );

    const switcher$ = this.selectedTab.valueChanges.pipe(
      tap(() => {
        this.currentTabType === 'send' ? this.address.enable() : this.address.disable();
      }),
      takeUntil(this.destroy$)
    );

    const sendingAll$ = this.sendingAll.valueChanges.pipe(
      tap((newValue: boolean) => {
        if (newValue) {
          this.amount.disable();
          this.amount.setValue(this.selectedSourceSelector().balance);
        } else if (this.amount.disabled) {
          this.amount.enable();
        }
      }),
      takeUntil(this.destroy$)
    );

    merge(
      amountValid$,
      switcher$,
      sendingAll$
    ).subscribe();
  }


  get ringSize(): AbstractControl {
    return this.targetForm.get('ringSize');
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
      }
    );
    dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.addressSelected.unsubscribe());
  }


  clearSendInputs(): void {
    this.address.setValue('');
    this.addressLabel.setValue('');
  }


  onSubmit() {
    // TODO: implement the form submission thing.
  }


  private selectedSourceSelector(): TxTypeOption {
    return this.selectorOptions.find(opt => opt.value === this.sourceType.value);
  }
}
