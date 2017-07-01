import { Component, OnInit, HostListener } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {

  entriesPerPage: number = 6;
  type: string = 'public';

  defaultAddress: Object = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['Empty']
    }

  addresses: any = {
    private: [this.defaultAddress],
    public: [this.defaultAddress]
  }
  selected: any = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['empty']
    };

    initialized: boolean = false;

  query: string;
  searchSubset: any = [];

  page: number = 1;
  pages: any = [];
  nav: any;

  qr: any = {
    el: undefined,
    size: undefined
  }

  constructor(private appService: AppService) { }

  @HostListener('window:keydown', ['$event'])
  keyboardInput(event: any) {
    // clear search bar on esc
    if (event.code.toLowerCase() === 'escape') {
      const searchbar: any = document.getElementById('searchbar');
      if (searchbar === document.activeElement) {
        searchbar.value = '';
        this.loadPages(this.addresses[this.type]);
      }
    }
  }

  ngOnInit() {
    // QR size
    this.qr.el = document.getElementsByClassName('card qr')[0];
    this.qr.size = this.qr.el.offsetWidth - 40;
    window.onresize = () => this.qr.size = this.qr.el.offsetWidth - 40;

    // start rpc
    this.rpc_update();
  }

  rpc_update() {
    this.appService.rpc.call(this, 'filteraddresses', [-1], this.rpc_loadAddressCount);
  }

  rpc_loadAddressCount(JSON: Object) {
    const count = JSON['num_receive'];
    this.appService.rpc.call(this, 'filteraddresses', [0, count, '0', '', '1'], this.rpc_loadAddresses);
  }

  rpc_loadAddresses(JSON: Object) {

    const pub = [];
    const priv = [];
    for (const k in JSON) {
      if (JSON[k].address.indexOf('p') === 0) {
        pub.push(JSON[k]);
      } else if (JSON[k].address.indexOf('T') === 0) {
        priv.push(JSON[k]);
      }
    }

    // I need to get the count of the addresses seperate in public/private first,
    // because this.addresses[type] can never be empty,
    // we need to delete our default address before doing addAddress..
    if (pub.length > 0) {
      this.addresses.public = [];
    }

    if (priv.length > 0) {
      this.addresses.private = [];
    }

    for (const k in pub) {
      if (true) { // make lint happy
        this.addAddress(pub[k], 'public');
      }
    }

    for (const k in priv) {
      if (true) { // make lint happy
        this.addAddress(priv[k], 'private');
      }
    }




    if (JSON[0] !== undefined) {
      this.sortArrays('public');
      this.sortArrays('private');

      if (this.type === 'public') {
        this.loadPages(this.addresses.public);
        this.selected = this.addresses.public[0];
      } else if (this.type === 'private') {
        this.loadPages(this.addresses.private);
        this.selected = this.addresses.private[0];
      }

    }

    if (!this.initialized) {
      this.initialized = true;
      this.checkIfFreshAddress();
    }
  }

  addAddress(JSON: Object, type: string) {
    const tempAddress = {
      id: 0,
      label: 'Empty label',
      address: 'Empty address',
      balance: 0,
      readable: ['Empty']
    }

    tempAddress.address = JSON['address'];
    if (JSON['label'] !== '') {
      tempAddress.label = JSON['label'];
    }

    tempAddress.readable = tempAddress.address.match(/.{1,4}/g);

    if (type === 'public') {
      tempAddress.id = JSON['path'].replace('m/0/', '');
      this.addresses.public.unshift(tempAddress);
      console.log('public ' + tempAddress.address);
    } else if (type === 'private') {
      tempAddress.id = +(JSON['path'].replace('m/0\'/', '').replace('\'', '')) / 2;
      this.addresses.private.unshift(tempAddress);
      console.log('priv ' + tempAddress.address);
    }
  }

  sortArrays(type: string) {
    function compare(a: Object, b: Object) {
      return b.id - a.id;
    }

    this.addresses[type].sort(compare);
  }

  search(query: string) {
    if (!query) {
      this.loadPages(this.addresses[this.type]);
      return;
    }
    // TODO doesn't search labels correctly
    // TODO should search address numbers
    this.searchSubset = this.addresses[this.type].filter(el => {
      return (
        el.label.toLowerCase().indexOf(query.toLowerCase()) !== -1
        || el.address.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    })
    this.loadPages(this.searchSubset, 0);
  }

  changeType(type: string) {
    this.type = type;
    this.selected = this.addresses[type][0];
    this.loadPages(this.addresses[this.type]);
  }

  loadPages(addresses: any[], i: number = 1) {
    const pages = [];
    for (i; i <= addresses.length; ) {
      const address = addresses.slice(i, i + this.entriesPerPage);
      pages.push(address);
      i += this.entriesPerPage;
    }
    this.pages = pages;
    this.pageNav();
  }

  checkIfFreshAddress() {
    if (this.addresses.public[0].address !== 'Empty address') {
      this.appService.rpc.call(this, 'getreceivedbyaddress', [this.addresses.public[0].address, 0], this.rpc_callbackFreshAddress);
    }
    setTimeout(() => { this.checkIfFreshAddress(); }, 30000);
  }

  rpc_callbackFreshAddress(JSON: Object) {
    console.log(JSON);
    if (JSON > 0) {
      this.appService.rpc.call(this, 'getnewaddress', null, this.rpc_callbackGenerateNewAddress);
    }
  }

  rpc_callbackGenerateNewAddress(JSON: Object) {
    this.rpc_update();
  }

  pageNav() {
    let nav = [];
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

    // TODO fix hack
    setTimeout(() => {
      const currentPage: any = document.getElementById(`page-${this.page}`)
      if (currentPage) {
        currentPage.style.color = '#03e8b0'
      }
    }, 50);
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

  gotoPage(page: any) {
    if (page !== '...') {
      document.getElementById(`page-${this.page}`).style.color = 'black';
      this.page = page;
    }
    this.pageNav();
  }

  copyAddress(id: string) {
    const address: any = document.getElementById(`address-${id}`)
      .getElementsByClassName('address')[0];
    let selectable: any = document.createElement('textarea');
    selectable.style.height = '0';
    selectable.id = 'selectable';
    document.body.appendChild(selectable);
    selectable.value = address.innerHTML.trim();
    selectable = document.getElementById('selectable');
    address.classList.add('copied');
    selectable.select();
    document.execCommand('copy');
    address.classList.remove('copied');
    document.body.removeChild(selectable);
  }

  newAddress() {
    const label = prompt('Label for new address');

    if (this.type === 'public') {
      this.appService.rpc.call(this, 'getnewaddress', [label], this.rpc_callbackGenerateNewAddress);
    } else if (this.type === 'private') {
      this.appService.rpc.call(this, 'getnewstealthaddress', [label], this.rpc_callbackGenerateNewAddress);
    }
  }

  selectInput() {
    const input: any = document.getElementsByClassName('header-input')[0];
    input.select();
  }

}
