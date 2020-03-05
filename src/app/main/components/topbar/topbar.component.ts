import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, flatMap } from 'rxjs/operators';


@Component({
  selector: 'main-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {

  public title: string = '';

  private destroy$: Subject<any> = new Subject();

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) { }


  ngOnInit() {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => {
        return this._route;
      }),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      flatMap(route => route.data),
      takeUntil(this.destroy$)
    ).subscribe(
      (data) => {
        this.title = data['title'] || '';
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
