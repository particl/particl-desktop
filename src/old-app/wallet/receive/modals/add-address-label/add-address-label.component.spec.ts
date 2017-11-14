import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressLabelComponent } from './add-address-label.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdDialogModule, MdDialogRef, MdFormFieldModule, MdInputModule, MdSnackBarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { RpcModule } from '../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../../shared/shared.module';
import { FlashNotificationService } from '../../../../services/flash-notification.service';
import { ModalsService } from '../../../../modals/modals.service';

describe('AddAddressLabelComponent', () => {
  let component: AddAddressLabelComponent;
  let fixture: ComponentFixture<AddAddressLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        BrowserModule,
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
        FlashNotificationService,
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
