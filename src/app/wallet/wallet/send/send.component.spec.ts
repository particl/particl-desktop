import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { ModalsModule } from '../../../modals/modals.module';

import { SharedModule } from '../../shared/shared.module'; // is this even needed?


import { SendComponent } from './send.component';
import { SendService } from 'app/wallet/wallet/send/send.service';

import { RpcService } from '../../../core/core.module';
import { RpcMockService } from '../../../_test/core-test/rpc-test/rpc-mock.service';

describe('SendComponent', () => {
  let component: SendComponent;
  let fixture: ComponentFixture<SendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        // WalletModule.forRoot(), // a bit circular here..
        BrowserAnimationsModule
      ],
      providers: [
        SendService,
        {provide: RpcService, useClass: RpcMockService},
        { provide: MatDialogRef },

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

  it('should get type', () => {
    expect(component.type).toBe('sendPayment');
  });
});
