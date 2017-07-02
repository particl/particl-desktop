import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';

import { AddressBookComponent } from './address-book.component';

describe('AddressBookComponent', () => {
  let component: AddressBookComponent;
  let fixture: ComponentFixture<AddressBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot()
      ],
      providers: [
        AppService,
        ElectronService,
        RPCService
      ],
      declarations: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
