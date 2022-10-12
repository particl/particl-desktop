import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';


// enum VersionText {
//   latest = 'This is the latest client version',
//   outdated = 'Newer app version available',
// }


@Component({
  selector: 'main-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit, OnDestroy {

  @Select(ApplicationConfigState.moduleVersions('app')) clientVersion$: Observable<string>;
  public newVersion: string = '';
  public isClientLatest: boolean = true;  // @TODO!!! perform check and correct this
  public clientUpdateText: string = '';   // @TODO!!! perform check and correct this
  public daemonVersion: string = '';      // @TODO!!! perform check and correct this


  constructor() { }


  ngOnInit() {
  }


  ngOnDestroy() {
  }

}
