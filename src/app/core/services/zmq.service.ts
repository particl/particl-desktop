import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Log } from 'ng2-logger'
import { Observable, EMPTY } from 'rxjs';

import { IpcService } from './ipc.service';
import { ZMQ } from '../store/app.actions';


@Injectable({
  providedIn: 'root'
})
export class ZmqService {

  log: any = Log.create('zmq.service');

  private IPC_CHANNEL: string = 'zmq';

  constructor(
    private _ipc: IpcService,
    private _store: Store
  ) { }


  listen() {
    this.log.d('Registering zmq service listener');
    if (window.electron) {
      this.disconnect();
      // Register a listener on the channel "zmq" (ipc)
      this._ipc.registerListener(this.IPC_CHANNEL, this.zmqListener.bind(this));
    }
  }


  private disconnect() {
    this._ipc.removeListeners(this.IPC_CHANNEL);
  }


  private zmqListener(channel: string, type: string, data: any): Observable<any> {
    this._store.dispatch(new ZMQ.UpdateStatus(channel, type, data));
    return EMPTY;
  }
}
