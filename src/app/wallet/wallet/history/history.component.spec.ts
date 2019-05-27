import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { RpcWithStateModule } from '../../../core/rpc/rpc.module';
import { CoreModule } from '../../../core/core.module';

import { HistoryComponent } from './history.component';
import { TransactionService } from 'app/wallet/wallet/shared/transaction.service';

import { TransactionsTableComponent } from 'app/wallet/wallet/shared/transaction-table/transaction-table.component';
import { MockTransactionService } from 'app/wallet/wallet/shared/transaction.mockservice';


describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        RpcWithStateModule.forRoot()
      ]
    })

  // Override TransactionsTableComponent's TransactionService
  .overrideComponent(TransactionsTableComponent, {
    set: {
      providers: [
        { provide: TransactionService, useClass: MockTransactionService }
      ]
    }
  })

  .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should history info section exist', () => {
    const compiled = fixture.debugElement.nativeElement;
    const txlist = compiled.querySelector('.tx-list');
    expect(txlist).toBeTruthy();
  });

  it('should have all type select by default', () => {
    const compiled = fixture.debugElement.nativeElement;
    const allType = compiled.querySelector('.mat-radio-label-content').textContent.trim();
    expect(allType).toEqual('All types');
  });

  it('should change category correctly', () => {
    component.changeCategory(1);
    expect(component.filters.category).toEqual('send');
    expect(component.selectedTab).toEqual(1);
    component.changeCategory(3);
    expect(component.filters.category).toEqual('stake');
    expect(component.selectedTab).toEqual(3);
  });

  it('should have default value set for filter and tab', () => {
    component.changeCategory(1);
    expect(component.selectedTab).toEqual(1);
    component.default();
    expect(component.selectedTab).toBe(0);
    expect(component.filters.category).toEqual('all');
    expect(component.filters.sort).toEqual('time');
    expect(component.filters.type).toEqual('all');
    expect(component.filters.search).toEqual('');
  });

  it('should clear filters', () => {
    component.changeCategory(1);
    expect(component.filters.category).toEqual('send');
    component.clear();
    expect(component.selectedTab).toBe(0);
    expect(component.filters.category).toEqual('all');
    expect(component.filters.sort).toEqual('time');
    expect(component.filters.type).toEqual('all');
    expect(component.filters.search).toEqual('');
  });
});
