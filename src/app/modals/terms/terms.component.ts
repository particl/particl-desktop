import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CloseGuiService } from 'app/core/close-gui/close-gui.service';
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  isAccepted: boolean = false;

  public text: string;
  constructor(
    private dialog: MatDialogRef<TermsComponent>,
    private close: CloseGuiService
  ) { }

  acceptTerms(): void {
    this.dialog.close();
  }

  decline(): void {
    this.close.quitElectron();
  }

}
