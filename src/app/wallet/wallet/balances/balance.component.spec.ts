import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

import { BalanceComponent } from './balance.component';
import { CoreModule } from 'app/core/core.module';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';
import { RpcStateServiceMock } from 'app/_test/core-test/rpc-test/rpc-state-mock.service';
import { RpcStateService } from 'app/core/rpc/rpc.module';
import { RpcService } from 'app/core/rpc/rpc.service';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot()
      ],
      providers: [
        { provide: RpcStateService, useClass: RpcStateServiceMock },
        { provide: RpcService, useClass: RpcMockService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct balance type', () => {
    component.type = 'total_balance';
    expect(component.getTypeOfBalance()).toBe('TOTAL BALANCE');
    component.type = 'actual_balance';
    expect(component.getTypeOfBalance()).toBe('Spendable');
    component.type = 'balance';
    expect(component.getTypeOfBalance()).toBe('Public');
    component.type = 'anon_balance';
    expect(component.getTypeOfBalance()).toBe('Anon (Private)');
    component.type = 'blind_balance';
    expect(component.getTypeOfBalance()).toBe('Blind (Private)');
    component.type = 'staked_balance';
    expect(component.getTypeOfBalance()).toBe('Staking');
    component.type = 'locked_balance';
    expect(component.getTypeOfBalance()).toBe('Locked');
    component.type = 'non-existing-option';
    expect(component.getTypeOfBalance()).toBe('non-existing-option');
    component.type = '';
    expect(component.getTypeOfBalance()).toBe('');
  });

  it('should calculate the correct balance', () => {
    component.type = 'total_balance';
    const total = 10;
    component.listUnSpent(total);
    expect(component.balance.getAmountAsString()).toBe('10');

    component.type = 'locked_balance';
    component.listUnSpent(total);
    expect(component.balance.getAmount().toFixed(1)).toBe('9.2');

    component.type = 'actual_balance';
    component.listUnSpent(total);
    expect(component.balance.getAmount().toFixed(1)).toBe('0.8');
  });

});
