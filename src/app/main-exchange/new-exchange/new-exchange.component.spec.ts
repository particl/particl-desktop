import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewExchangeComponent } from './new-exchange.component';

describe('NewExchangeComponent', () => {
  let component: NewExchangeComponent;
  let fixture: ComponentFixture<NewExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
