import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutProcessComponent } from './checkout-process.component';

describe('CheckoutProcessComponent', () => {
  let component: CheckoutProcessComponent;
  let fixture: ComponentFixture<CheckoutProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
