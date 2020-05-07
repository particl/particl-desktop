import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyOrderListItemComponent } from './buy-order-list-item.component';

describe('BuyOrderListItemComponent', () => {
  let component: BuyOrderListItemComponent;
  let fixture: ComponentFixture<BuyOrderListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyOrderListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyOrderListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
