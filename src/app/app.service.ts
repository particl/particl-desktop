import { Injectable } from '@angular/core';

import { RPCService } from './core/rpc/rpc.service';

@Injectable()
export class AppService {
  public isElectron: boolean = false;

  constructor(public rpc: RPCService) {
    this.isElectron = this.rpc.electronService.isElectronApp;
    rpc.postConstruct(this);
  }
}
