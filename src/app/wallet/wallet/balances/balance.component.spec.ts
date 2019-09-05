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

  it('should have been created', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct default balance values', () => {
    expect(component.balanceWhole).toBe('0');
    expect(component.balanceSep).toBe('');
    expect(component.balanceFraction).toBe('');
  });

});
