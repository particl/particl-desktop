import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { ModalsModule } from '../../modals/modals.module';
import { SharedModule } from '../shared/shared.module';
import { WalletModule } from '../wallet/wallet.module';
import { CoreModule } from '../../core/core.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { OverviewComponent } from './overview.component';
import { StakinginfoComponent } from './widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './widgets/coldstake/coldstake.component';
import { TransactionService } from 'app/wallet/wallet/shared/transaction.service';

import { TransactionsTableComponent } from 'app/wallet/wallet/shared/transaction-table/transaction-table.component';
import { MockTransactionService } from 'app/wallet/wallet/shared/transaction.mockservice';


describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
      ],
      declarations: [
        OverviewComponent,
        StakinginfoComponent,
        ColdstakeComponent
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
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
