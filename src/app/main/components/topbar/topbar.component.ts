import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'main-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {

  public title: string = '';

  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private _route: ActivatedRoute
  ) { }


  ngOnInit() {
    this._route.data.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      (data) => {
        this.title = data['title'] || '';
      }
    );
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
