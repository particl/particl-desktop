import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'
import { Observable, Subject } from 'rxjs';

import { IpcService } from 'app/core/ipc/ipc.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { SettingsStateService } from 'app/settings/settings-state.service';
import { environment } from 'environments/environment';


@Injectable()
export class UpdaterService {

  log: any = Log.create('updater.service id:' + Math.floor((Math.random() * 1000) + 1));
  private DAEMON_CHANNEL: string = 'daemon';
  private status: Subject<string> = new Subject<string>();

  constructor(
    private _ipc: IpcService,
    private _rpc: RpcService,
    private _multi: MultiwalletService,
    private _settings: SettingsStateService
  ) {
    this.log.d('Registering ipc listener for updater');
    if (window.electron || !environment.isTesting) {
      this.log.d('Registering ipc listener for updater');
      // Register a listener on the channel "updater" (ipc)
      this._ipc.registerListener(this.DAEMON_CHANNEL, this.daemonListener.bind(this));
      this._ipc.runCommand('start-system', null, null);
    }
  }

  get currentStatus(): Observable<any> {
    return this.status.asObservable();
  }

  /*
   This is called every incoming message on update channel.
   node -> GUI (and reply back)
  */
  daemonListener(status: any): Observable<any> {

    return Observable.create(observer => {

      switch (status.type) {
        case 'update':
          this.update(status.content);
          break;
        case 'error':
          this.status.next(status.content);
          break;
        case 'info':
          this.status.next(status.content);
          break;
        case 'done':
          this.status.next('Application initialized, loading user interface...');
          this.setReady(status.content);
          break;
      }

      // complete
      observer.complete();
    });
  }

  update(status: any) {
    if (status.status === 'started') {
      this.status.next('Downloading new Particl Core...');
    } else if (status.status === 'busy') {
      const statusCalc = Math.trunc((status.transferred / status.total) * 100);
      this.status.next(`Downloading a new Particl Core...  ${statusCalc.toFixed(0)}%`);
    } else if (status.status === 'done') {
      // TODO: Do we need to display indication to the user if an error occurred
      this.status.next('Download complete');
    } else if (status.status === 'error') {
      this.status.next('An error occurred while downloading');
    }
  }

  setReady(config: any) {
    // Boot various services now (RPC > MULTIWALLET > SETTINGS)
    this._rpc.initialize(config);

    this._multi.initialize();
    const $multiSub = this._multi.list.subscribe(
      (wallets) => {
        if (wallets.length > 0) {
          $multiSub.unsubscribe();
          this._settings.initialize().subscribe(
            null,
            null,
            () => {
              this.status.complete();
            });
        }
      }
    )
  }
}
