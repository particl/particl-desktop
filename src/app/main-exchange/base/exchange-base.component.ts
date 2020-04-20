import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatExpansionPanel } from '@angular/material';

interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
}

@Component({
  selector: 'app-exchange-base',
  templateUrl: './exchange-base.component.html',
  styleUrls: ['./exchange-base.component.scss']
})
export class ExchangeBaseComponent implements OnInit {

  readonly menu: IMenuItem[] = [
    {text: 'Overview', path: 'overview', icon: 'part-overview'},
    {text: 'New Exchange', path: 'new', icon: 'part-circle-plus'},
    {text: 'Exchange Bots', path: 'bots', icon: 'part-tool'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
