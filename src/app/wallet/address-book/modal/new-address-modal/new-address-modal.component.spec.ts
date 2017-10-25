import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAddressModalComponent } from './new-address-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { RpcModule } from '../../../../core/rpc/rpc.module';
import { BrowserModule } from '@angular/platform-browser';
import { MdDialogModule, MdDialogRef, MdFormFieldModule, MdInputModule, MdSnackBarModule } from '@angular/material';
import { FlashNotificationService } from '../../../../services/flash-notification.service';
import { ModalsService } from '../../../../modals/modals.service';

describe('NewAddressModalComponent', () => {
  let component: NewAddressModalComponent;
  let fixture: ComponentFixture<NewAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot(),
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        MdFormFieldModule,
        MdDialogModule,
        MdSnackBarModule,
        MdInputModule
      ],
      declarations: [ NewAddressModalComponent ],
      providers: [
        FlashNotificationService,
        ModalsService,
        { provide: MdDialogRef}
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
