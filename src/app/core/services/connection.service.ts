import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { environment } from 'environments/environment';
import { IpcService } from './ipc.service';
import { Global } from '../store/app.actions';
import { CoreConnectionModel, AppSettingsStateModel } from '../store/app.models';
import { AppSettingsState } from '../store/appsettings.state';


@Injectable(
  {providedIn: 'root'}
)
export class ConnectionService {

  private DAEMON_CHANNEL: string = 'daemon';
  private isStarted: boolean = false;
  private zmqPort: number;

  constructor(
    private _ipc: IpcService,
    private store: Store
  ) { }

  /*
   This is called every incoming message on update channel.
   node -> GUI (and reply back)
  */

  connect() {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;

    if (!(window.electron || !environment.isTesting)) {
      return;
    }

    const settings = (<AppSettingsStateModel>this.store.selectSnapshot(AppSettingsState));
    this.zmqPort = settings.zmqPort;

    this._ipc.removeListeners(this.DAEMON_CHANNEL);
    this._ipc.registerListener(this.DAEMON_CHANNEL, this.daemonListener.bind(this));
    this._ipc.runCommand('start-system', null, {zmq_port: this.zmqPort});
  }

  private daemonListener(status: any): Observable<any> {

    return Observable.create(observer => {

      switch (status.type) {
        case 'update':
          this.update(status.content);
          break;
        case 'error':
          this.updateStatus(status.content);
          break;
        case 'info':
          this.updateStatus(status.content);
          break;
        case 'done':
          this.updateStatus('Starting service listeners…');
          const coreConfig = (<CoreConnectionModel>status.content);
          this._ipc.removeListeners(this.DAEMON_CHANNEL);
          this._ipc.runCommand('zmq-connect', null, {zmq_port: this.zmqPort, zmq_host: coreConfig.rpcbind}).subscribe(
            (resp) => {
              if (resp) {
                this.updateStatus('Verifying network connection…');
              }
            },
            () => {
              this.updateStatus('Error initializing service listeners!');
            },
            () => {
              this.store.dispatch(new Global.ConnectionReady(coreConfig));
            }
          );
          break;
      }

      // complete
      observer.complete();
    });
  }

  private updateStatus(msg: string) {
    this.store.dispatch(new Global.SetLoadingMessage(msg));
  }

  private update(status: any) {
    if (status.status === 'started') {
      this.updateStatus('Downloading new Particl Core…');
    } else if (status.status === 'busy') {
      const statusCalc = Math.trunc((status.transferred / status.total) * 100);
      this.updateStatus(`Downloading new Particl Core… ${statusCalc.toFixed(0)}%`);
    } else if (status.status === 'done') {
      // TODO: Do we need to display indication to the user if an error occurred
      this.updateStatus('Download complete');
    } else if (status.status === 'error') {
      this.updateStatus('An error occurred while downloading');
    }
  }
}
