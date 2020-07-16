import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingProfileAddressComponent } from './shipping-profile-address.component';

describe('ShippingProfileAddressComponent', () => {
  let component: ShippingProfileAddressComponent;
  let fixture: ComponentFixture<ShippingProfileAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShippingProfileAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingProfileAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
