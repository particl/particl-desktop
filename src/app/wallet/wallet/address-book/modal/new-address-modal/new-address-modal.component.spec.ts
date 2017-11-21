import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdDialogModule, MdDialogRef, MdFormFieldModule, MdInputModule, MdSnackBarModule } from '@angular/material';

import { RpcModule } from '../../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../../shared/shared.module';

import { SnackbarService } from '../../../../../core/snackbar/snackbar.service';
import { ModalsService } from '../../../../../modals/modals.service';
import { AddressService } from '../../../shared/address.service';

import { NewAddressModalComponent } from './new-address-modal.component';
import { IpcService } from '../../../../../core/ipc/ipc.service';

describe('NewAddressModalComponent', () => {
  let component: NewAddressModalComponent;
  let fixture: ComponentFixture<NewAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        /* deps */
        // BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MdFormFieldModule,
        MdDialogModule,
        MdSnackBarModule,
        MdInputModule,
        /* own */
        SharedModule,
        RpcModule.forRoot()
      ],
      declarations: [ NewAddressModalComponent ],
      providers: [
        /* deps */
        { provide: MdDialogRef},
        /* own */
        SnackbarService,
        ModalsService,
        AddressService,
        IpcService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
