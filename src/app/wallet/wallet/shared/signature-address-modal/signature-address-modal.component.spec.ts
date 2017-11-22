import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdSnackBarModule } from '@angular/material';

import { CoreModule, SnackbarService } from '../../../../core/core.module';
import { WalletModule } from '../../wallet.module';
import { SharedModule } from '../../../shared/shared.module';
import { ModalsModule, ModalsService } from '../../../../modals/modals.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

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
        ModalsModule.forRoot(),
        CoreUiModule.forRoot(),
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
