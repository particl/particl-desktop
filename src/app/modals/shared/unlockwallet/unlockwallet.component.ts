import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent implements Input {

  private showPass: boolean = false;
  private password: string;

  @Input() unlockButton;
  @Output() passwordEmitter = new EventEmitter<string>();

  passwordInputType(): string {
    return (this.showPass ? "text" : "password");
  }

  unlock() {
    this.passwordEmitter.emit(this.password);
  }
}
