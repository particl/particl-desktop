import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { MaterialModule } from '../../core-ui/material/material.module';


import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { SendConfirmationModalComponent } from './send-confirmation-modal.component';
import { SendService } from 'app/wallet/wallet/send/send.service';
import { SendMockService } from 'app/_test/wallet-test/send-test/send-mock.service';
import { TransactionBuilder } from 'app/wallet/wallet/send/transaction-builder.model';


describe('SendConfirmationModalComponent', () => {
  let component: SendConfirmationModalComponent;
  let fixture: ComponentFixture<SendConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MaterialModule,
        MatFormFieldModule // check if this is required. If so, move into CoreUi.
      ],
      declarations: [ SendConfirmationModalComponent ],
      providers: [
        SnackbarService,
        {provide: SendService, useClass: SendMockService},
        { provide: MatDialogRef},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendConfirmationModalComponent);
    component = fixture.componentInstance;
    component.send = new TransactionBuilder();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
