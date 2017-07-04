import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalsModule } from '../../modals.module';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements Input, Output {

  private showPass: boolean = false;
  password: string;

  @Input() unlockButton: string;
  @Output() passwordEmitter: EventEmitter<string> = new EventEmitter<string>();

  passwordInputType(): string {
    return (this.showPass ? 'text' : 'password');
  }

  unlock() {
    this.passwordEmitter.emit(this.password);
  }
}
