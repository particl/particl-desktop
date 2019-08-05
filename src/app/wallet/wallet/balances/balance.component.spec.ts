import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

import { BalanceComponent } from './balance.component';
import { CoreModule } from 'app/core/core.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        RpcWithStateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have been created', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct default balance values', () => {
    expect(component.balanceWhole).toBe('0');
    expect(component.balanceSep).toBe('');
    expect(component.balanceFraction).toBe('');
  });

/*
  it('should get balance point', () => {
    component.getBalancePoint();
    expect(component.getBalancePoint).toBeTruthy();
  });

  it('should get balance after point', () => {
    component.getBalanceAfterPoint(true)
    expect(component.getBalanceAfterPoint).toBeTruthy();
  });

  it('should get type of balance', () => {
    component.getTypeOfBalance();
    expect(component.getTypeOfBalance).toBeTruthy();
  });
*/
});
