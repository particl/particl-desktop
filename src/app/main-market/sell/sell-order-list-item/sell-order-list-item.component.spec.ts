import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellOrderListItemComponent } from './sell-order-list-item.component';

describe('SellOrderListItemComponent', () => {
  let component: SellOrderListItemComponent;
  let fixture: ComponentFixture<SellOrderListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellOrderListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellOrderListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
