import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { CoreModule } from '../../../core/core.module';

import { ModalsService } from '../../../modals/modals.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { AddressBookComponent } from './address-book.component';


describe('AddressBookComponent', () => {
  let component: AddressBookComponent;
  let fixture: ComponentFixture<AddressBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        MdSnackBarModule,
        BrowserAnimationsModule
      ],
      declarations: [ ],
      providers: [ SnackbarService, ModalsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
