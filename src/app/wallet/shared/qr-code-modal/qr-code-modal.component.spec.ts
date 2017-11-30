import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogRef } from '@angular/material';

import { WalletModule } from '../../wallet.module';

import { FlashNotificationService } from '../../../services/flash-notification.service';

import { QrCodeModalComponent } from './qr-code-modal.component';

describe('QrCodeModalComponent', () => {
  let component: QrCodeModalComponent;
  let fixture: ComponentFixture<QrCodeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ WalletModule ],
      providers: [
        { provide: MdDialogRef}, FlashNotificationService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
