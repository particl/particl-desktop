import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { RpcModule } from '../../../core/rpc/rpc.module';
import { CoreModule } from '../../../core/core.module';

import { HistoryComponent } from './history.component';
import { TransactionService } from 'app/wallet/wallet/shared/transaction.service';


describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
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
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter by category', () => {
    // component.filterByCategory('all');
    // expect(component.category).toBe('all');
  });
});
