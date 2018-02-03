import { Component, OnInit } from '@angular/core';
import { RpcService } from '../../core/core.module';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  testnet: boolean = false;
  constructor(private _rpc: RpcService) { }

  ngOnInit() {
    // check if testnet -> Show/Hide Anon Balance
    this._rpc.state.observe('chain').take(1)
     .subscribe(chain => this.testnet = chain === 'test');
  }

}
