import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalsModule } from '../../modals.module';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent implements Input, Output {

  private showPass: boolean = false;
  private password: string;

  @Input() unlockText: string = "YOUR WALLET PASSWORD";
  @Input() unlockButton: string;
  @Output() passwordEmitter: EventEmitter<string> = new EventEmitter<string>();

  passwordInputType(): string {
    return (this.showPass ? 'text' : 'password');
  }

  unlock() {
    this.passwordEmitter.emit(this.password);
  }
}
