import { Component } from '@angular/core';
import { CloseGuiService } from 'app/core/close-gui/close-gui.service';

@Component({
  selector: 'app-terms',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  testnet: boolean = false;

  constructor(
    private close: CloseGuiService
  ) { }

  quitApp(): void {
    this.close.quitElectron();
  }

}
