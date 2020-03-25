import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { AppSettingsState } from 'app/core/store/appsettings.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { IpcService } from 'app/core/services/ipc.service';
import { AppSettingsStateModel, CoreConnectionModel } from 'app/core/store/app.models';
import { environment } from 'environments/environment';


@Injectable()
export class MarketService {

  private log: any = Log.create('market.service id:' + Math.floor((Math.random() * 1000) + 1));
  private url: string = `http://${environment.marketHost}:${environment.marketPort}/api/`;
  private isConnected: boolean = false;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService,
    private _store: Store
  ) {
    this.log.d('starting service...');
  }


  startMarketService(marketPort: number): Observable<boolean> {
    const settings: AppSettingsStateModel = this._store.selectSnapshot(AppSettingsState);

    return this._ipc.runCommand('start-market', null, marketPort, settings.zmqPort).pipe(
      tap((started: boolean) => {
        this.isConnected = Boolean(started);  // ensure null response is converted accordingly

        if (started) {
          const connDetails: CoreConnectionModel = this._store.selectSnapshot(CoreConnectionState);
          this.url = `http://${connDetails.rpcbind}:${marketPort}/api/`;
        }
      })
    );
  }


  stopMarketService() {
    this._ipc.runCommand('stop-market', null, null);
    this.isConnected = false;
  }


  public call(method: string, params?: Array<any> | null): Observable<any> {

    if (!this.isConnected) {
      return observableThrowError('Market service not started');
    }

    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1,
      jsonrpc: '2.0'
    });

    const headerJson = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    return this._http.post(this.url + 'rpc', postData, { headers: new HttpHeaders(headerJson) }).pipe(
      map((response: any) => response.result),
      catchError((error: any) => {
        this.log.d('Market threw an error!');
        this.log.d('Market error:', error);
        error = this.extractMPErrorMessage(error.error);
        return observableThrowError(error);
      })
    );
  }


  private extractMPErrorMessage(errorObj: any): string {
    if (errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    } else if (errorObj && Object.prototype.toString.call(errorObj.error) === '[object Object]') {
      return this.extractMPErrorMessage(errorObj.error);
    }
    return 'Invalid marketplace request';
  }
}
