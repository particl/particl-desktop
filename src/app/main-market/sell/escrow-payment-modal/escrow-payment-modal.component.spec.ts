import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscrowPaymentModalComponent } from './escrow-payment-modal.component';

describe('EscrowPaymentModalComponent', () => {
  let component: EscrowPaymentModalComponent;
  let fixture: ComponentFixture<EscrowPaymentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscrowPaymentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscrowPaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
