import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOverviewComponent } from './overview.component';

describe('ExchangeOverviewComponent', () => {
  let component: ExchangeOverviewComponent;
  let fixture: ComponentFixture<ExchangeOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
