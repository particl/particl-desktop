import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { SendComponent } from './send.component';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

import { RPCService } from '../../core/rpc/rpc.service';

describe('SendComponent', () => {
  let component: SendComponent;
  let fixture: ComponentFixture<SendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot()
      ],
      providers: [
        ElectronService,
        RPCService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open send tab', () => {
    expect(component.sendTab).toBeTruthy();
  });

  it('should get balances', () => {
    expect(component.getBalance).toBeTruthy()
  });

  it('should open validate', () => {
    expect(component.openValidate).toBeTruthy();
  });

  it('should close validate', () => {
    expect(component.closeValidate).toBeTruthy();
  });

  it('should select address', () => {
    expect(component.selectAddress).toBeTruthy();
  });

  it('should select address', () => {
    expect(component.selectAddress).toBeTruthy();
  });

  it('should clear', () => {
    expect(component.clear).toBeTruthy()
  });

  it('should pay', () => {
    expect(component.pay).toBeTruthy()
  });

  it('should toggle advanced', () => {
    expect(component.toggleAdvanced).toBeTruthy();
  });

  it('should check address', () => {
    expect(component.checkAddress).toBeTruthy();
  });

  it('should verify amount', () => {
    expect(component.verifyAmount).toBeTruthy();
  });

  it('should verify address', () => {
    expect(component.verifyAddress).toBeTruthy();
  });

  it('should call back address', () => {
    expect(component.rpc_callbackVerifyAddress).toBeTruthy();
  });

  it('should open lookup', () => {
    expect(component.openLookup).toBeTruthy();
  });

  it('should get addressLookup property', () => {
    expect(component.addressLookup).toBeDefined();
  });

  it('should get send', () => {
    expect(component.send).toBeTruthy();
  });

  it('should get advanced', () => {
    expect(component.advanced).toBe(false);
  });

  it('should get lookup', () => {
    expect(component.lookup).toBe(undefined);
  });

  it('should get type', () => {
    expect(component.type).toBe('sendPayment');
  });
});
