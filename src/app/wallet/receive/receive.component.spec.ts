import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { ReceiveComponent } from './receive.component';


describe('ReceiveComponent', () => {
  let component: ReceiveComponent;
  let fixture: ComponentFixture<ReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveComponent ],
      imports: [
        FormsModule,
        SharedModule,
        QRCodeModule,
        RpcModule.forRoot()
      ]
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

  it('should execute rpc_update', () => {
    expect(component.rpc_update).toBeTruthy();
  });

  it('should execute rpc_loadAddressCount', () => {
    expect(component.rpc_loadAddressCount).toBeTruthy();
  });

  it('should execute rpc_loadAddresses', () => {
    expect(component.rpc_loadAddresses).toBeTruthy();
  });

  it('should addAddress', () => {
    expect(component.addAddress).toBeTruthy();
  });

  it('should sortArrays', () => {
    expect(component.sortArrays).toBeTruthy();
  });

  it('should search', () => {
    expect(component.search).toBeTruthy();
  });

  it('should changeType', () => {
    expect(component.changeType).toBeTruthy();
  });

  it('should loadPages', () => {
    expect(component.loadPages).toBeTruthy();
  });

  it('should checkIfFreshAddress', () => {
    expect(component.checkIfFreshAddress).toBeTruthy();
  });

  it('should rpc_callbackFreshAddress', () => {
    expect(component.rpc_callbackFreshAddress).toBeTruthy();
  });

  it('should rpc_callbackGenerateNewAddress', () => {
    expect(component.rpc_callbackGenerateNewAddress).toBeTruthy();
  });

  it('should pageNav', () => {
    expect(component.pageNav).toBeTruthy();
  });

  it('should go to previousPage', () => {
    expect(component.previousPage).toBeTruthy();
  });

  it('should go to nextPage', () => {
    expect(component.nextPage).toBeTruthy();
  });

  it('should gotoPage', () => {
    expect(component.gotoPage).toBeTruthy();
  });

  it('should copyAddress', () => {
    expect(component.copyAddress).toBeTruthy();
  });

  it('should newAddress', () => {
    expect(component.newAddress).toBeTruthy();
  });

  it('should selectInput', () => {
    expect(component.selectInput).toBeTruthy();
  });

  it('should get addresses', () => {
    expect(component.addresses).toBeDefined();
  });

  it('should get defaultAddress', () => {
    expect(component.defaultAddress).toBeDefined();
  });

  it('should get entriesPerPage', () => {
    expect(component.entriesPerPage).toBe(6);
  });

  it('should get initialized', () => {
    expect(component.initialized).toBe(false);
  });

  it('should get nav', () => {
    expect(component.nav).toBe(undefined);
  });

  it('should get page', () => {
    expect(component.page).toBe(1);
  });

  it('should get pages', () => {
    expect(component.pages).toBeDefined();
  });

  it('should get qr', () => {
    expect(component.qr).toBeDefined();
  });

  it('should get query', () => {
    expect(component.query).toBe(undefined);
  });

  it('should get searchSubset', () => {
    expect(component.searchSubset).toBeDefined();
  });

  it('should get selected', () => {
    expect(component.selected).toBeDefined();
  });

  it('should get type', () => {
    expect(component.type).toBe('public');
  });
});
