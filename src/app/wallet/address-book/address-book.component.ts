import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  label: string;
  type: string = 'normal';

  constructor() { }

  ngOnInit() {
    document.onkeydown = evt => {
      if (evt.key.toLowerCase() === 'escape') {
        this.closeNewAddress();
      }
    }
  }

  openNewAddress() {
    document.getElementById('address-modal').classList.remove('hide');
  }

  closeNewAddress() {
    document.getElementById('address-modal').classList.add('hide');
  }

  newAddress() {
    console.log(this.label, this.type)
  }

}
