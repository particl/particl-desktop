import { Component, OnInit } from '@angular/core';

import { StateService } from '../../../core/state/state.service';
@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  private coldStakingEnabled: boolean = undefined;

  constructor(
    private state: StateService,
    // private _rpc: RPCService
  ) { 
    this.state.observe('coldstake').subscribe(status => {this.coldStakingEnabled = status;     console.log(status);});
  }

  ngOnInit() {
  }

  isColdStakingEnabled() {
    return this.coldStakingEnabled;
  }
}
