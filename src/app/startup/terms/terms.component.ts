import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CloseGuiService } from 'app/core/services/close-gui.service';
import { TermsContentComponent } from 'app/core-ui/components/terms-content/terms-content.component';


@Component({
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {

  isAccepted: boolean = false;

  @ViewChild(TermsContentComponent, { static: false }) private termsComp!: TermsContentComponent;

  constructor(
    private router: Router,
    private close: CloseGuiService
  ) {}


  acceptTerms(): void {
    this.termsComp.saveContent();
    this.router.navigate(['/main/extra/welcome/']);
  }


  decline(): void {
    this.close.quitElectron();
  }

}
