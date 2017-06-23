import { Injectable } from '@angular/core';

import { RPCService } from './core/rpc/rpc.service';

@Injectable()
export class AppService {
  public isElectron: boolean = false;

  constructor(public rpc: RPCService) {
    this.isElectron = this.rpc.electronService.isElectronApp;
    rpc.postConstruct(this);
    this.testRpc();
  }

  testRpc(): void {
    this.rpc.register(this, 'getwalletinfo', null, this.testRpcResult, 'both');
    this.rpc.poll();
    setTimeout(() => { this.rpc.stopPolling() }, 10000);
  }

  testRpcResult(asd: any) {
    console.log(asd);
  }
}
