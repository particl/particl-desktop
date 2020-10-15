import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-question-thread-list-item',
  templateUrl: './question-thread-list-item.component.html',
  styleUrls: ['./question-thread-list-item.component.scss']
})
export class QuestionThreadListItemComponent implements OnInit {

  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

}
