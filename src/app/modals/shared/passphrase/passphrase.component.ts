import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent {

  words: string[] = Array(24).fill('');

  @Input() readOnly: any = false;

  constructor() { }

}
