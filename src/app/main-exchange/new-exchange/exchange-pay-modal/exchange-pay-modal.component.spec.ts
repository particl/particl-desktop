import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangePayModalComponent } from './exchange-pay-modal.component';

describe('ExchangePayModalComponent', () => {
  let component: ExchangePayModalComponent;
  let fixture: ComponentFixture<ExchangePayModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangePayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangePayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
