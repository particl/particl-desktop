import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyOrdersPageComponent } from './buy-orders-page.component';

describe('BuyOrdersPageComponent', () => {
  let component: BuyOrdersPageComponent;
  let fixture: ComponentFixture<BuyOrdersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyOrdersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyOrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
