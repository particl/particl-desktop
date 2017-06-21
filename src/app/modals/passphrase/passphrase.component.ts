import { Component } from '@angular/core';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent {

  unlock(password) {
    // TODO API call
    console.log(password);
  }
}
