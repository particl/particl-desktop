import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-question-answer-thread',
  templateUrl: './question-answer-thread.component.html',
  styleUrls: ['./question-answer-thread.component.scss']
})
export class QuestionAnswerThreadComponent implements OnInit {

  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

}
