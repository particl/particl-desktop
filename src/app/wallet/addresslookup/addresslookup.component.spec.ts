import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletModule } from '../wallet.module';
import { RpcModule } from '../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { AddressLookupComponent } from './addresslookup.component';

describe('AddressLookupComponent', () => {
  let component: AddressLookupComponent;
  let fixture: ComponentFixture<AddressLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot(),
        WalletModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should show', () => {
    component.show();
    expect(component.staticLookup.isShown).toBe(true);
  });

  it('should hide', () => {
    component.hide();
    expect(component.staticLookup.isShown).toBe(false);
  });
*/
  it('should get filterAddress', () => {
    expect(component.filterAddress).toBe(undefined);
  });

  it('should get lookupAddresses', () => {
    expect(component.lookupAddresses).toBeDefined();
  });

  it('should get staticLookup', () => {
    expect(component.staticLookup).toBeDefined();
  });
});
