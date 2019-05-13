import { async, ComponentFixture, inject, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

import { BalanceComponent } from './balance.component';
import { CoreModule } from 'app/core/core.module';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';
import { RpcService, RpcStateService } from 'app/core/rpc/rpc.module';

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
        RpcStateService,
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

  it('should return a balance equal to 0 (getIntegerPart)', () => {
    expect(component.balance.getIntegerPart()).toBe(0);
  });

  it('should return a balance equal to 0 (getFractionalPart)', () => {
    expect(component.balance.getFractionalPart()).toBe('');
  });

  it('should not return a dot because its just 0, not 0.0 ', () => {
    expect(component.balance.dot()).toBe('');
  });

  it('should return TOTAL BALANCE as string', () => {
    component.type = 'total_balance'
    expect(component.getTypeOfBalance()).toBe('TOTAL BALANCE');
  });

  it('should return SPENDABLE as string', () => {
    component.type = 'actual_balance'
    expect(component.getTypeOfBalance()).toBe('Spendable');
  });

  it('should return PUBLIC as string', () => {
    component.type = 'balance'
    expect(component.getTypeOfBalance()).toBe('Public');
  });

  it('should return PRIVATE as string', () => {
    component.type = 'anon_balance'
    expect(component.getTypeOfBalance()).toBe('Anon (Private)');
  });

  it('should return BLIND as string', () => {
    component.type = 'blind_balance'
    expect(component.getTypeOfBalance()).toBe('Blind (Private)');
  });

  it('should return STAKING as string', () => {
    component.type = 'staked_balance'
    expect(component.getTypeOfBalance()).toBe('Staking');
  });

  it('should return LOCKED as string', () => {
    component.type = 'locked_balance'
    expect(component.getTypeOfBalance()).toBe('Locked');
  });

});
