import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOrderDeliveredModalComponent } from './confirm-order-delivered-modal.component';

describe('ConfirmOrderDeliveredModalComponent', () => {
  let component: ConfirmOrderDeliveredModalComponent;
  let fixture: ComponentFixture<ConfirmOrderDeliveredModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmOrderDeliveredModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmOrderDeliveredModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
