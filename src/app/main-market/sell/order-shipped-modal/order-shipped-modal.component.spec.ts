import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderShippedModalComponent } from './order-shipped-modal.component';

describe('OrderShippedModalComponent', () => {
  let component: OrderShippedModalComponent;
  let fixture: ComponentFixture<OrderShippedModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderShippedModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderShippedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
