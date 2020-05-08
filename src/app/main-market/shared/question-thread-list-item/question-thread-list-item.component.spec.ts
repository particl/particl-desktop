import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionThreadListItemComponent } from './question-thread-list-item.component';

describe('QuestionThreadListItemComponent', () => {
  let component: QuestionThreadListItemComponent;
  let fixture: ComponentFixture<QuestionThreadListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionThreadListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionThreadListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
