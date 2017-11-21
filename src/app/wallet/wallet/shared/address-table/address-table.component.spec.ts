import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../../shared/shared.module';
import { WalletModule } from '../../../wallet/wallet.module';
import { CoreModule } from '../../../core/core.module';

import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
import { ModalsService } from '../../../../modals/modals.service';


import { AddressTableComponent } from './address-table.component';

describe('AddressTableComponent', () => {
  let component: AddressTableComponent;
  let fixture: ComponentFixture<AddressTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,  // is this even needed?
        WalletModule.forRoot(),  // is this even needed?
        CoreModule.forRoot(),
        MdSnackBarModule  // is this even needed, Core-UI?
      ],
      providers: [ SnackbarService, ModalsService ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should changePage', () => {
    // component.pageChanged();
    expect(component.pageChanged).toBeTruthy();
  });
*/
  it('should get addressService', () => {
    expect(component._addressService).toBeDefined();
  });
});
