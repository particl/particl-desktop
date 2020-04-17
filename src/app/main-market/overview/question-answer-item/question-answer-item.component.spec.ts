import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAnswerItemComponent } from './question-answer-item.component';

describe('QuestionAnswerItemComponent', () => {
  let component: QuestionAnswerItemComponent;
  let fixture: ComponentFixture<QuestionAnswerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionAnswerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAnswerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
