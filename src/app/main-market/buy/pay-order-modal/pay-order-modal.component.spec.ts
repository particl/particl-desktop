import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayOrderModalComponent } from './pay-order-modal.component';

describe('PayOrderModalComponent', () => {
  let component: PayOrderModalComponent;
  let fixture: ComponentFixture<PayOrderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayOrderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
