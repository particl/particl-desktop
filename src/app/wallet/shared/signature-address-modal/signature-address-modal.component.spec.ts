import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureAddressModalComponent } from './signature-address-modal.component';
import { WalletModule } from '../../wallet.module';
import { RpcModule } from '../../../core/rpc/rpc.module';
import { SharedModule } from '../../../shared/shared.module';
import { FlashNotificationService } from '../../../services/flash-notification.service';
import { MdSnackBarModule } from '@angular/material';
import { ModalsService } from '../../../modals/modals.service';

describe('SignatureAddressModalComponent', () => {
  let component: SignatureAddressModalComponent;
  let fixture: ComponentFixture<SignatureAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule,
        RpcModule.forRoot(),
        MdSnackBarModule
      ],
      providers: [FlashNotificationService, ModalsService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
