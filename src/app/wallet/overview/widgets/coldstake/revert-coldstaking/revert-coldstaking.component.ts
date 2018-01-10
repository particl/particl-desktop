import { Component, OnInit } from '@angular/core';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../../../core/rpc/rpc.service';

@Component({
  selector: 'app-revert-coldstaking',
  templateUrl: './revert-coldstaking.component.html',
  styleUrls: ['./revert-coldstaking.component.scss']
})
export class RevertColdstakingComponent implements OnInit {

  private log: any = Log.create('zap-coldstaking');

  public fee: number;
  public utxos: any;

  constructor(
    private _rpc: RpcService
  ) { }

  ngOnInit() { }

  revertColdstaking() {

    // TODO: move to coldstaking service
    this.log.d('undo coldstaking');

    this._rpc.call('walletsettings', ['changeaddress', '"{}"']).subscribe(res => {
      this.log.d('coldstaking undo changeaddress', res);
    });
  }

}
