import { Component, OnInit } from '@angular/core';
import { RpcStateService } from '../../core/core.module';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  testnet: boolean = false;
  constructor(private rpcState: RpcStateService) { }

  ngOnInit() {
    // check if testnet -> Show/Hide Anon Balance
    this.rpcState.observe('getblockchaininfo', 'chain').take(1)
     .subscribe(chain => this.testnet = chain === 'test');
  }

}
