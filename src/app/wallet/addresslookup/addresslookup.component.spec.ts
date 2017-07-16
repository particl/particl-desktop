import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletModule } from '../wallet.module';

import { AddressLookupComponent } from './addresslookup.component';

describe('AddressLookupComponent', () => {
  let component: AddressLookupComponent;
  let fixture: ComponentFixture<AddressLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WalletModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
