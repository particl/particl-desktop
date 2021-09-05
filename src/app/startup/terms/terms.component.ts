import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CloseGuiService } from 'app/core/services/close-gui.service';
import { termsObj } from 'app/startup/terms/terms-txt';


@Component({
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {

  isAccepted: boolean;

  public text: string = termsObj.text;
  constructor(
    private router: Router,
    private close: CloseGuiService
  ) {}

  acceptTerms(): void {
    localStorage.setItem('terms', JSON.stringify(termsObj));
    this.router.navigate(['/main/extra/welcome/']);
  }

  decline(): void {
    this.close.quitElectron();
  }

}
