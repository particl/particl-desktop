import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalsModule } from '../../modals.module';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements Input, Output {


  private password: string;
  private showPass: boolean = false;
  private stakeOnly: boolean = false;

  @Input() unlockText: string = 'YOUR WALLET PASSWORD';
  @Input() unlockButton: string;
  @Output() passwordEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  passwordInputType(): string {
    return (this.showPass ? 'text' : 'password');
  }

  unlock() {

    const obj = {
      password: this.password,
      stakeOnly: this.stakeOnly
    }

    this.passwordEmitter.emit(obj);

    this.password = '';
  }
}
