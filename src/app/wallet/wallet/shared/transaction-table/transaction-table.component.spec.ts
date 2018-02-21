import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RpcModule } from '../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../shared/shared.module';
import { WalletModule } from '../../../wallet/wallet.module';
import { CoreModule } from '../../../../core/core.module';

import { TransactionsTableComponent } from './transaction-table.component';
import { TransactionService } from 'app/wallet/wallet/shared/transaction.service';
import { MockTransactionService } from 'app/wallet/wallet/shared/transaction.mockservice';



describe('TransactionTableComponent', () => {
  let component: TransactionsTableComponent;
  let fixture: ComponentFixture<TransactionsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        RpcModule.forRoot(),
        CoreModule.forRoot(),
        BrowserAnimationsModule
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
    fixture = TestBed.createComponent(TransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

/*
  it('initializes the component', fakeAsync(() => {
    let service = fixture.debugElement.injector.get(TransactionService);
    console.warn("MockTxService");
    console.warn(service.txs);

    component.ngOnInit(); // call ngOnInit
    tick(); // simulate a tick

    // expect(service.get.toHaveBeenCalled);
    // here you could add an expect to validate component state after the service completes
})); */

it('should create', () => {
  expect(component).toBeTruthy();
});

/*
  it('should change page', () => {
    // component.pageChanged()
    expect(component.pageChanged).toBeTruthy();
  });
*/
  it('should get log', () => {
    expect(component.log).toBeDefined();
  });

  it('should get txService', () => {
    expect(component.txService).toBeDefined();
  });
});
