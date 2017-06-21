import { Component } from '@angular/core';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent {

  password: string;
  showPass: boolean = false;

  passwordInputType(): string {
    return (this.showPass ? "text" : "password");
  }

  unlock() {
    // TODO API call
    console.log(this.password);
  }
}
