import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressLabelComponent } from './add-address-label.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdDialogModule, MdDialogRef, MdFormFieldModule, MdInputModule, MdSnackBarModule } from '@angular/material';
//import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RpcModule } from '../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../../shared/shared.module';
import { SnackbarService } from '../../../../../core/snackbar/snackbar.service';
import { ModalsService } from '../../../../../../modals/modals.service';

describe('AddAddressLabelComponent', () => {
  let component: AddAddressLabelComponent;
  let fixture: ComponentFixture<AddAddressLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        // BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        MdDialogModule,
        FormsModule,
        MdFormFieldModule,
        MdSnackBarModule,
        MdInputModule,
        RpcModule.forRoot()],
      declarations: [AddAddressLabelComponent],
      providers: [
        ModalsService,
        SnackbarService,
        { provide: MdDialogRef}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAddressLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
