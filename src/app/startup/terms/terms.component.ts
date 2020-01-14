import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CloseGuiService } from 'app/core/services/close-gui.service';
import { termsObj } from 'app/startup/terms/terms-txt';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';



@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  @Select(CoreConnectionState.isTestnet) testnet: Observable<boolean>;

  isAccepted: boolean;

  public text: string = termsObj.text;
  constructor(
    private router: Router,
    private close: CloseGuiService
  ) {}

  acceptTerms(): void {
    localStorage.setItem('terms', JSON.stringify(termsObj));
    this.router.navigate(['/main']);
  }

  decline(): void {
    this.close.quitElectron();
  }

}
