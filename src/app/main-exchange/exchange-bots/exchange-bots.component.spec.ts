import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeBotsComponent } from './exchange-bots.component';

describe('ExchangeBotsComponent', () => {
  let component: ExchangeBotsComponent;
  let fixture: ComponentFixture<ExchangeBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
