import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QRCodeModule } from 'angularx-qrcode';

import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { ModalsModule } from '../../../modals/modals.module';

import { SharedModule } from '../../shared/shared.module';  // is this even needed?

import { ReceiveComponent } from './receive.component';

describe('ReceiveComponent', () => {
  let component: ReceiveComponent;
  let fixture: ComponentFixture<ReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveComponent ],
      imports: [
        /* deps */
        QRCodeModule,
        BrowserAnimationsModule,
        /* own */
        SharedModule,  // is this even needed?
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot()
      ],
      providers: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should addAddress', () => {
    const address = {
      label: 'test address label',
      address: 'test address address',
      path: 'm/0/0'
    };
    component.addAddress(address, 'public');
    expect(component.addresses.public.length).toBe(1);
  });

  it('should get addresses', () => {
    expect(component.addresses).toBeDefined();
  });

  // it('should get defaultAddress', () => {
  //   expect(component.defaultAddress).toBeDefined();
  // });

  it('should get initialized', () => {
    expect(component.initialized).toBeFalsy()
  });

  it('should get page', () => {
    expect(component.page).toBe(1);
  });

  it('should get query', () => {
    expect(component.query).toBe('');
  });

  it('should get selected', () => {
    component.selectAddress('selectedAddress');
    expect(component.selected).toBeDefined();
  });
    /* We will come back to RPC at a later stage
    it('should execute rpc_update', () => {
      component.rpc_update();
      expect(component.rpc_update).toBeTruthy();
    });

    it('should execute rpc_loadAddressCount', () => {
      component.rpc_loadAddressCount(new Object);
      expect(component.rpc_loadAddressCount).toBeTruthy();
    });

    it('should execute rpc_loadAddresses', () => {
      component.rpc_loadAddresses(new Object);
      expect(component.rpc_loadAddresses).toBeTruthy();
    });

    it('should sortArrays', () => {
      //component.sortArrays();
      expect(component.sortArrays).toBeTruthy();
    });

    it('should search', () => {
      //component.search();
      expect(component.search).toBeTruthy();
    });

    it('should changeType', () => {
      //component.changeType()
      expect(component.changeType).toBeTruthy();
    });

    it('should loadPages', () => {
      //component.loadPages()
      expect(component.loadPages).toBeTruthy();
    });

    it('should checkIfFreshAddress', () => {
      component.checkIfFreshAddress();
      expect(component.checkIfFreshAddress).toBeTruthy();
    });

    it('should rpc_callbackFreshAddress', () => {
      component.rpc_callbackFreshAddress_success(new Object);
      expect(component.rpc_callbackFreshAddress_success).toBeTruthy();
    });

    it('should rpc_callbackGenerateNewAddress', () => {
      component.rpc_callbackGenerateFreshAddress_success(new Object);
      expect(component.rpc_callbackGenerateFreshAddress_success).toBeTruthy();
    });

    it('should pageNav', () => {
      component.pageNav();
      expect(component.pageNav).toBeTruthy();
    });

    it('should go to previousPage', () => {
      component.previousPage();
      expect(component.previousPage).toBeTruthy();
    });

    it('should go to nextPage', () => {
      component.nextPage();
      expect(component.nextPage).toBeTruthy();
    });

    it('should gotoPage', () => {
      //component.gotoPage();
      expect(component.gotoPage).toBeTruthy();
    });

    it('should copyAddress', () => {
      //component.copyAddress();
      expect(component.copyAddress).toBeTruthy();
    });

    it('should newAddress', () => {
      component.newAddress();
      expect(component.newAddress).toBeTruthy();
    });

    it('should selectInput', () => {
      component.selectInput();
      expect(component.selectInput).toBeTruthy();
    });
    */

});
