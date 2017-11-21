import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlashNotificationService } from '../../../services/flash-notification.service';
import { MdSnackBarModule } from '@angular/material';

import { RpcModule } from '../../../../core/rpc/rpc.module';
import { WalletModule } from '../../wallet.module';
import { SharedModule } from '../../../shared/shared.module';

import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
import { ModalsService } from '../../../../modals/modals.service';

import { SignatureAddressModalComponent } from './signature-address-modal.component';

describe('SignatureAddressModalComponent', () => {
  let component: SignatureAddressModalComponent;
  let fixture: ComponentFixture<SignatureAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,  // is this even needed?
        WalletModule, // is this even needed?
        CoreModule.forRoot(),
        MdSnackBarModule  // is this even needed, import Core-UI instead?
      ],
      providers: [SnackbarService, ModalsService]
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
