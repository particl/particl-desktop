import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogRef, MdSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module'; // is this even needed?
import { WalletModule } from '../wallet.module';
import { CoreModule, IpcService } from '../../../core/core.module';

import { SendComponent } from './send.component';


describe('SendComponent', () => {
  let component: SendComponent;
  let fixture: ComponentFixture<SendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        MdSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MdDialogRef }
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
  /* cant do RPC yet

    it('should call back address', () => {
      // component.rpc_callbackVerifyAddress();
      expect(component.rpc_callbackVerifyAddress).toBeTruthy();
    });
  */
  it('should send tab', () => {
    component.selectTab(1);
    expect(component.type).toBe('balanceTransfer');
  });

  it('should verify amount no balance service', () => {
    component.send.amount = 555.555555;
    expect(component.checkAmount()).toBeFalsy();
  });
/*

    it('should open lookup', () => {
      component.openLookup();
      expect(component.openLookup).toBe('true');
    });
*/
/*
  it('should get balances', () => {
    // component.getBalance();
    expect(component.getBalance).toBeTruthy()
  });

  it('should open validate', () => {
    component.openValidate();
    expect(component.openValidate).toBeTruthy();
  });

  it('should close validate', () => {
    component.closeValidate();
    expect(component.closeValidate).toBeTruthy();
  });

  it('should select address', () => {
    // component.selectAddress();
    expect(component.selectAddress).toBeTruthy();
  });

  it('should clear', () => {
    component.clear();
    expect(component.clear).toBeTruthy()
  });

  it('should pay', () => {
    component.pay();
    expect(component.pay).toBeTruthy()
  });

  it('should toggle advanced', () => {
    component.toggleAdvanced();
    expect(component.toggleAdvanced).toBeTruthy();
  });

  it('should check address', () => {
    component.checkAddress();
    expect(component.checkAddress).toBeTruthy();
  });

  it('should verify amount', () => {
    component.verifyAmount();
    expect(component.verifyAmount).toBeTruthy();
  });

  it('should verify address', () => {
    component.verifyAddress();
    expect(component.verifyAddress).toBeTruthy();
  });

  it('should get send', () => {
    expect(component.send).toBeTruthy();
  });
*/

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
