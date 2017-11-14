import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IpcService } from './ipc/ipc.service';
import { RpcModule } from './rpc/rpc.module';
import { WindowService } from './window/window.service';

  /*
	Loading the core library will intialize IPC & RPC
  */
@NgModule({
  imports: [
    CommonModule,
    RpcModule.forRoot() // TODO: should be here?
  ],
  declarations: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        IpcService,
        WindowService
      ]
    };
  }
}

export { WindowService } from './window/window.service';
export { RpcService } from './rpc/rpc.module';