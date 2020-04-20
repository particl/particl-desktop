import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeBaseComponent } from './exchange-base.component';

describe('ExchangeBaseComponent', () => {
  let component: ExchangeBaseComponent;
  let fixture: ComponentFixture<ExchangeBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
