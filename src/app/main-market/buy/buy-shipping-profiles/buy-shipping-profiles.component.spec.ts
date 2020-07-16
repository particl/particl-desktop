import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyShippingProfilesComponent } from './buy-shipping-profiles.component';

describe('BuyShippingProfilesComponent', () => {
  let component: BuyShippingProfilesComponent;
  let fixture: ComponentFixture<BuyShippingProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyShippingProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyShippingProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
