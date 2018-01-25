import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-core-router',
  templateUrl: './core-router.component.html',
  styleUrls: ['./core-router.component.scss']
})
export class CoreRouterComponent implements OnInit {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.load();
    setTimeout(this.wallet.bind(this), 30000);
  }

  load() {
    this._router.navigate(['loading']);
  }

  wallet() {
    this._router.navigate(['wallet/main']);
  }
}
