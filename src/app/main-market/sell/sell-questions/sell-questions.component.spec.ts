import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellQuestionsComponent } from './sell-questions.component';

describe('SellQuestionsComponent', () => {
  let component: SellQuestionsComponent;
  let fixture: ComponentFixture<SellQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
