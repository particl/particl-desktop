import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-multiwallet-router',
  templateUrl: './multiwallet-router.component.html',
  styleUrls: ['./multiwallet-router.component.scss']
})
export class MultiwalletRouterComponent implements OnInit {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    console.log('multiwallet loaded!');
    //this._router.navigate(['multi/installer/test']);
  }

}
