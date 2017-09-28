import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeModalComponent } from './qr-code-modal.component';
import { WalletModule } from '../../wallet.module';
import { MdDialogRef } from '@angular/material';

describe('QrCodeModalComponent', () => {
  let component: QrCodeModalComponent;
  let fixture: ComponentFixture<QrCodeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ WalletModule ],
      providers: [
        { provide: MdDialogRef}
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
