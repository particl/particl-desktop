import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../../../core/core.module';
import { WalletModule } from '../../wallet.module';
import { SharedModule } from '../../../shared/shared.module';
import { ModalsModule } from '../../../../modals/modals.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

import { SignatureAddressModalComponent } from './signature-address-modal.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

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
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef }
      ]
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
