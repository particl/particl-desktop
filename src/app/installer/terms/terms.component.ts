import { Component } from '@angular/core';
import { CloseGuiService } from 'app/core/close-gui/close-gui.service';
import { termsObj } from 'app/installer/terms/terms-txt';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  isAccepted: boolean = false;

  public text: string = termsObj.text;
  constructor(
    private router: Router,
    private close: CloseGuiService
  ) { }

  acceptTerms(): void {
    localStorage.setItem('terms', JSON.stringify(termsObj));
    this.router.navigate(['loading']);
  }

  decline(): void {
    this.close.quitElectron();
  }

}
