import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-question-answer-item',
  templateUrl: './question-answer-item.component.html',
  styleUrls: ['./question-answer-item.component.scss']
})
export class QuestionAnswerItemComponent implements OnInit {

  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

}
