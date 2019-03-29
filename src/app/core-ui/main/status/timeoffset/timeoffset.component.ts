import { Component, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../../core/rpc/rpc-state/rpc-state.service';

@Component({
  selector: 'app-timeoffset',
  templateUrl: './timeoffset.component.html',
  styleUrls: ['./timeoffset.component.scss']
})
export class TimeoffsetComponent implements OnInit, OnDestroy {

  // general
  private log: any = Log.create('status.component');
  private destroyed: boolean = false;

  // state
  public offset: number = 0;

  constructor(
    private _rpcState: RpcStateService) { }

  ngOnInit() {
    this._rpcState.observe('getnetworkinfo', 'timeoffset')
      .takeWhile(() => !this.destroyed)
      .subscribe(offset => this.offset = offset);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
