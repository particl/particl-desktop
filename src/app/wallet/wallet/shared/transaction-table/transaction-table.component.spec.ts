import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RpcModule } from '../../../../core/rpc/rpc.module';

import { SharedModule } from '../../../shared/shared.module';
import { WalletModule } from '../../../wallet/wallet.module';
import { CoreModule } from '../../../../core/core.module';

import { TransactionsTableComponent } from './transaction-table.component';
import { TransactionService } from 'app/wallet/wallet/shared/transaction.service';



describe('TransactionTableComponent', () => {
  let component: TransactionsTableComponent;
  let fixture: ComponentFixture<TransactionsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        RpcModule.forRoot(),
        CoreModule.forRoot()
      ],
      providers: [
        TransactionService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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
