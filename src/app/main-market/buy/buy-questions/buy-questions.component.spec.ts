import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyQuestionsComponent } from './buy-questions.component';

describe('BuyQuestionsComponent', () => {
  let component: BuyQuestionsComponent;
  let fixture: ComponentFixture<BuyQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
