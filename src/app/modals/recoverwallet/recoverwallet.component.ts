import { Component } from '@angular/core';

@Component({
  selector: 'app-recoverwallet',
  templateUrl: './recoverwallet.component.html',
  styleUrls: ['./recoverwallet.component.scss']
})
export class RecoverwalletComponent {

  words: string[] = Array(24).fill('');

  restore(password) {
    // TODO API call
    console.log(this.words, password);
  }
}
