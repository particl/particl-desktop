import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
    console.log('multiwallet loaded!');
    // this._router.navigate(['multi/installer/test']);
  }

}
