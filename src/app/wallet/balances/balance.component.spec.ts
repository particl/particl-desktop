import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceComponent } from './balance.component';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';
import { StateService } from '../../core/state/state.service';

import { Amount } from '../../shared/util/utils';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot()
      ],
      providers: [StateService]
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

  it('should get balance before point', () => {
    component.balance.getIntegerPart();
    expect(component.balance.getIntegerPart).toBe(0);
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
