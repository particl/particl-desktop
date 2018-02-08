import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {

  sortings: Array<any> = [
    { title: 'By time',                  value: 'time'          },
    { title: 'By amount',                value: 'amount'        },
    { title: 'By address',               value: 'address'       },
    { title: 'By category',              value: 'category'      },
    { title: 'By confirmations',         value: 'confirmations' },
    { title: 'By transaction ID (txid)', value: 'txid'          }
  ];

  statuses: Array<any> = [
    { title: 'All listings', value: 'all',     amount: '5' },
    { title: 'Pending',      value: 'pending', amount: '1' },
    { title: 'Listed',       value: 'listed',  amount: '2' },
    { title: 'In escrow',    value: 'escrow',  amount: '0' },
    { title: 'Shipped',      value: 'shipped', amount: '1' },
    { title: 'Sold',         value: 'sold',    amount: '1' },
    { title: 'Expired',      value: 'expired', amount: '0' },
  ];

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  constructor(private router: Router) { }

  ngOnInit() {
  }

  addItem() {
    this.router.navigate(['/market/add-item']);
  }

  clear(): void {
    this.filters();
  }
}
