
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
  constructor(private _router: Router, private _route: ActivatedRoute) { }
  ngOnInit() { this._router.navigate(['loading']) }
}




import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Preload strategry */
import { PreloadingStrategy, PreloadAllModules, Route } from '@angular/router';
/* end preload strategy */

import { LoadingComponent } from '../loading/loading.component';

import { installer_routing } from 'app/installer/installer.router';

import { MainRouterComponent } from 'app/core-ui/main/main.router';

import { wallet_routes_children } from 'app/wallet/wallet.routing';
import { market_routes_children } from 'app/market/market.routing';


const walletAndMarketRoutes = wallet_routes_children.concat(<any>market_routes_children);

/* actual routing */
const routes: Routes = [
  { path: '', redirectTo: 'multi', pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent },
  installer_routing,
  { path: 'main', component: MainRouterComponent, children: walletAndMarketRoutes }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules});

