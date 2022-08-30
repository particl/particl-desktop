import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';


enum TextContent {
}


@Component({
  templateUrl: './core-config.component.html',
  styleUrls: ['./core-config.component.scss']
})
export class CoreConfigComponent implements OnInit, OnDestroy {


  private destroy$: Subject<void> = new Subject();


  constructor(

  ) { }


  ngOnInit() {

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
