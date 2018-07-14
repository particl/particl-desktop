import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

/*
        Core Router
        -----------

This is the parent router for the whole application.

core-router
    loading-component
    multi-router: (multiwallet sidebar + router)
        main-router (navigation sidebar + page router)
            wallet (pages)
            market (pages)
        installer-router
            create-wallet

*/
@Component({
  selector: 'app-core-router',
  template: `<router-outlet></router-outlet>`
})
export class CoreRouterComponent implements OnInit {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    // loading screen
    console.log('navigating to loading!');
    this._router.navigate(['loading']);
  }


}