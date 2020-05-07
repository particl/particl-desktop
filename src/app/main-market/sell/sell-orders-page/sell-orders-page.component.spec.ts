import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellOrdersPageComponent } from './sell-orders-page.component';

describe('SellOrdersPageComponent', () => {
  let component: SellOrdersPageComponent;
  let fixture: ComponentFixture<SellOrdersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellOrdersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellOrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
