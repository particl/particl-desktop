import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceOrderModalComponent } from './place-order-modal.component';

describe('PlaceOrderModalComponent', () => {
  let component: PlaceOrderModalComponent;
  let fixture: ComponentFixture<PlaceOrderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceOrderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
