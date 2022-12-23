import { Component } from '@angular/core';
import { termsObj } from 'app/startup/terms/terms-txt';


@Component({
  selector: 'app-terms-conditions-content',
  templateUrl: './terms-content.component.html',
  styleUrls: ['./terms-content.component.scss']
})
export class TermsContentComponent {

  readonly termsText: string = termsObj.text;


  constructor(
  ) {}


  saveContent() {
    localStorage.setItem('terms', JSON.stringify(termsObj));
  }

}
