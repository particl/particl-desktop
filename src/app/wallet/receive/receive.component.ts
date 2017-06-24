import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {

  entriesPerPage = 6;
  type: string;

  addresses = {
    private: [],
    public: []
  }
  selected;

  page: number = 1;
  pages = [];
  nav;

  qr = {
    el: undefined,
    size: undefined
  }

  constructor() { }

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // clear search bar on esc
    if (event.code.toLowerCase() === 'escape') {
      let searchbar: any = document.getElementById('searchbar');
      if (searchbar === document.activeElement) {
        searchbar.value = '';
      }
    }
  }

  ngOnInit() {
    // QR size
    this.qr.el = document.getElementsByClassName("card qr")[0];
    this.qr.size = this.qr.el.offsetWidth - 40;
    window.onresize = () => this.qr.size = this.qr.el.offsetWidth - 40;

    // TODO remove init data
    const publicAddress = {
      id: 249,
      label: "I'm label one",
      address: "PwGP8BzRUHQwchwwPuzAe9WqskgmTLNx8F",
      balance: 2000.30
    }
    const privateAddress = {
      id: 138,
      label: "I'm label one",
      address: "4et9EGvUtNighRLspBeuxxMLHZmNKjbfJxTkLUGPf8hu2WbRi6w",
      balance: 1732.80
    }
    let address = JSON.parse(JSON.stringify(publicAddress));
    for (let id = 0; id < publicAddress.id; id++) {
      let pushAddress = JSON.parse(JSON.stringify(address));
      pushAddress.id = id;
      let array = publicAddress.address.split('');
      pushAddress.address = array.sort(() => .5 - Math.random()).join('');
      pushAddress.readable = pushAddress.address.match(/.{1,4}/g);
      array = publicAddress.label.split('');
      pushAddress.label = array.sort(() => .5 - Math.random()).join('');
      this.addresses.public.unshift(pushAddress)
    }
    address = JSON.parse(JSON.stringify(privateAddress));
    for (let id = 0; id < privateAddress.id; id++) {
      let pushAddress = JSON.parse(JSON.stringify(address));
      pushAddress.id = id;
      let array = privateAddress.address.split('');
      pushAddress.address = array.sort(() => .5 - Math.random()).join('');
      pushAddress.readable = pushAddress.address.match(/.{1,4}/g);
      array = privateAddress.label.split('');
      pushAddress.label = array.sort(() => .5 - Math.random()).join('');
      this.addresses.private.unshift(pushAddress)
    }

    this.changeType('public');
  }

  changeType(type) {
    this.type = type;
    this.selected = this.addresses[type][0];
    this.loadPages();
  }

  loadPages() {
    let pages = [];
    for (let i = 1; i <= this.addresses[this.type].length;) {
      pages.push(this.addresses[this.type].slice(i, i + this.entriesPerPage));
      i += this.entriesPerPage;
    }
    this.pages = pages;
    this.pageNav();
  }

  pageNav() {
    let nav;
    if (this.pages.length <= 5) {
      for (let i = 1; i <= this.pages.length; i++) {
        nav.push(i);
      }
    } else {
      nav = [ '1' ];
      if (this.page > 3) {
        nav.push('...');
        for (let i = this.page - 1; i < this.page + 2; i++) {
          if (i < this.pages.length) {
            nav.push(i);
          }
        }
      } else {
        for (let i = 2; i <= 4; i++) {
          if (i < this.pages.length) {
            nav.push(i);
          }
        }
      }
      if (this.pages.length >= this.page + 3) {
        nav.push('...');
      }
      nav.push(this.pages.length);
    }
    this.nav = nav;
    setTimeout(() => document.getElementById(`page-${this.page}`).style.color = '#03e8b0',
      50);
    ;
  }

  previousPage() {
    if (this.page > 1) {
      document.getElementById(`page-${this.page}`).style.color = 'black';
      this.page--;
    }
    this.pageNav();
  }

  nextPage() {
    if (this.page < this.pages.length) {
      document.getElementById(`page-${this.page}`).style.color = 'black';
      this.page++;
    }
    this.pageNav();
  }

  gotoPage(page) {
    if (page !== '...') {
      document.getElementById(`page-${this.page}`).style.color = 'black';
      this.page = page;
    }
    this.pageNav();
  }

  copyAddress(id) {
    let address: any = document.getElementById(`address-${id}`)
      .getElementsByClassName('address')[0];
    let selectable: any = document.createElement('textarea');
    selectable.style.height = '0';
    selectable.id = 'selectable';
    document.body.appendChild(selectable);
    selectable.value = address.innerHTML;
    selectable = document.getElementById('selectable');
    address.classList.add('copied');
    selectable.select();
    document.execCommand('copy');
    address.classList.remove('copied');
    document.body.removeChild(selectable);
  }

  newAddress() {
    let label = prompt('Label for new address');
    this.addresses[this.type].unshift({
      id: this.addresses[this.type].length,
      label: label,
      address: 'THISISNEWADDRESS',
      readable: ['this', 'is', 'new', 'address'],
      balance: 0
    });
    this.loadPages();
  }

  selectInput() {
    let input: any = document.getElementsByClassName('header-input')[0];
    input.select();
  }

}
