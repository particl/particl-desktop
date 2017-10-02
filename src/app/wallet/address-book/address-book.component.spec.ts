import { async, ComponentFixture, TestBed } from '@angular/core/testing';


import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { ModalsService } from '../../modals/modals.service';

import { AddressBookComponent } from './address-book.component';

describe('AddressBookComponent', () => {
  let component: AddressBookComponent;
  let fixture: ComponentFixture<AddressBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot(),
         RpcModule.forRoot()
      ],
      declarations: [ ],
      providers: [
        ModalsService
      ]
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
