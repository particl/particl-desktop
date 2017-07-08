import { Component } from '@angular/core';

@Component({
  selector: 'app-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss']
})
export class FinishComponent {

  constructor() { }

  close() {
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.body.dispatchEvent(escape);
  }

}
