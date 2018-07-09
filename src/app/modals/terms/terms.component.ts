import {Component} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  isScrolled: boolean = false;
  public text: string;
  constructor(private dialog: MatDialogRef<TermsComponent>) { }

  acceptTerms(): void {
    this.dialog.close();
  }

  onScroll($event: any) {
    const pos = $event.target.offsetHeight + $event.target.scrollTop;
    const max = $event.target.scrollHeight;
    if (pos === max) {
      this.isScrolled = true;
    }
  }
}
