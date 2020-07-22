import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

// @FIXME: source https://v8.material.angular.io/components/sort/overview
export interface UTXO {
  amount: number;
  label: string;
  address: string;
  date: string;
}

@Component({
  selector: 'app-coin-control-modal',
  templateUrl: './coin-control-modal.component.html',
  styleUrls: ['./coin-control-modal.component.scss']
})
export class CoinControlModalComponent implements OnInit {

  availableUTXOs: UTXO[] = [
    {
      amount: 0.0001,
      label: 'Staking rewards',
      address: 'pbZwtzJTnYgaXgLHyyyq3ZZzFNhThDhAkQ',
      date: '10.05.20 22:46'},
    {
      amount: 4562.0450100,
      label: 'Bittrex',
      address: 'pbZwt3ZZzFNhThDhAkQzJTnYgaXgLHyyyq',
      date: '09.05.20 12:47'},
    {
      amount: 12.94511500,
      label: 'Profits from my humble Shop',
      address: 'ps1qqpwx3jklsc84z70wl6a5fz5lrp9kx3lkrlqj5xp0kkydc3sdpmpj8qpqvgtkggc3aqh0g9stcyqf8y4du6lpca689lmslkus6netx6mcjarvqqqq50yyt',
      date: '01.05.20 05:32'},
    {
      amount: 0.0000100,
      label: 'Staking rewards',
      address: 'pHyyyq3ZZzFNhThDhAkQbZwtzJTnYgaXgL',
      date: '07.05.20 05:30'},
    {
      amount: 88999888.88889999,
      label: 'Profits from my humble Shop',
      address: 'ps1qqpwx3jklsc84z70wl6a5fz5lrp9kx3lkrlqj5xp0kkydc3sdpmpj8qpqvgtkggc3aqh0g9stcyqf8y4du6lpca689lmslkus6netx6mcjarvqqqq50yyt',
      date: '10.05.20 22:46'},
  ];

  sortedData: UTXO[];

  constructor() {
    this.sortedData = this.availableUTXOs.slice();
  }

  sortData(sort: Sort) {
    const data = this.availableUTXOs.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'amount': return compare(a.amount, b.amount, isAsc);
        case 'label': return compare(a.label, b.label, isAsc);
        case 'address': return compare(a.address, b.address, isAsc);
        case 'date': return compare(a.date, b.date, isAsc);
        default: return 0;
      }
    });
  }

  ngOnInit() {
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
