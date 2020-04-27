import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAnswerThreadComponent } from './question-answer-thread.component';

describe('QuestionAnswerThreadComponent', () => {
  let component: QuestionAnswerThreadComponent;
  let fixture: ComponentFixture<QuestionAnswerThreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionAnswerThreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAnswerThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
