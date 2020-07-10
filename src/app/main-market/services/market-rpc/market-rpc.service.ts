import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { AppSettingsState } from 'app/core/store/appsettings.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { Observable, throwError as observableThrowError, Subject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { IpcService } from 'app/core/services/ipc.service';
import { AppSettingsStateModel, CoreConnectionModel } from 'app/core/store/app.models';
import { environment } from 'environments/environment';
import { SupportedMessageTypes, SocketMessages_v03 } from '../../shared/market-socket.models';


interface SocketDataObject {
  n: number;
  data: any;
}

type SocketMessageHandlersType = { [P in keyof SupportedMessageTypes]: Subject<SupportedMessageTypes[P]>};
type SocketMessageListeners = { [P in keyof SupportedMessageTypes]: Observable<SupportedMessageTypes[P]>};
interface SocketMessageHandlers extends SocketMessageHandlersType {
  // simplistic attempt at indicating that the type has some form of iterator
  dontUseThis?: string;
}

@Injectable()
export class MarketRpcService {

  private log: any = Log.create('market.service id:' + Math.floor((Math.random() * 1000) + 1));
  private url: string = `http://${environment.marketHost}:${environment.marketPort}/`;
  private isConnected: boolean = false;

  private marketSocket: WebSocketSubject<SocketDataObject | number> = null;

  private MESSAGE_HANDLERS: SocketMessageHandlers = {
    MPA_LISTING_ADD_03: null
  };


  constructor(
    private _http: HttpClient,
    private _ipc: IpcService,
    private _store: Store
  ) {
    this.log.d('starting service...');
  }


  startMarketService(marketPort: number): Observable<boolean> {
    const appSettings: AppSettingsStateModel = this._store.selectSnapshot(AppSettingsState);

    return this._ipc.runCommand('start-market', null, marketPort, appSettings.zmqPort).pipe(
      tap((started: boolean) => {
        this.isConnected = Boolean(started);  // ensure null response is converted accordingly

        if (started) {
          const connDetails: CoreConnectionModel = this._store.selectSnapshot(CoreConnectionState);
          this.url = `http://${connDetails.rpcbind}:${marketPort}/`;

          this.setupWebSocket();
        }
      })
    );
  }


  stopMarketService() {
    this.closeWebSocket();
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

    return this._http.post(this.url + 'api/rpc', postData, { headers: new HttpHeaders(headerJson) }).pipe(
      map((response: any) => response.result),
      catchError((error: any) => {
        this.log.d('Market threw an error!');
        this.log.d('Market error:', error);
        error = this.extractMPErrorMessage(error.error);
        return observableThrowError(error);
      })
    );
  }


  subscribeToSocketEvents<K extends keyof SocketMessageListeners>(msgType: K) {
    return this.MESSAGE_HANDLERS[msgType].asObservable();
  }


  private extractMPErrorMessage(errorObj: any): string {
    if (errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    } else if (errorObj && Object.prototype.toString.call(errorObj.error) === '[object Object]') {
      return this.extractMPErrorMessage(errorObj.error);
    }
    return 'Invalid marketplace request';
  }


  private closeWebSocket() {
    if (this.marketSocket !== null) {
      this.marketSocket.complete();
      this.marketSocket = null;
    }
  }


  private setupWebSocket(): void {

    const needsCreation = this.marketSocket === null;

    if (needsCreation) {
      let url = this.url;
      if (url.startsWith('http')) {
        url = url.replace('http', 'ws');
      }
      // this appears to be necessary since the marketplace is using socket.io
      url += 'socket.io/?EIO=3&transport=websocket';

      // create the websocket
      this.marketSocket = webSocket({
        url: url,
        openObserver: {
          next: () => this.log.i('websocket connection established')
        },
        deserializer: ({data}) => {
          const retValue: SocketDataObject = {
            n: 0,
            data: null
          };
          if (typeof data === 'string') {
            let n = 0;
            for (const ch of data) {
              if (!(+ch < Number.MAX_SAFE_INTEGER)) {
                break;
              }
              n++;
            }
            if (n > 0) {
              retValue.n = +data.slice(0, n);
            }
            if (n < (data.length - 1)) {
              try {
                retValue.data = JSON.parse(data.slice(n));
              } catch (e) {}
            }
          } else if (typeof data === 'object') {
            try {
              retValue.data = JSON.parse(JSON.stringify(data));
            } catch (e) {}
          }
          return retValue;
        }
      });

      // setup msg handlers
      this.setupMessageListeners();

    }

    if (this.isConnected && (this.marketSocket.closed || needsCreation)) {
      this.marketSocket.subscribe(
        (msg: SocketDataObject) => {
          if (Object.prototype.toString.call(msg.data) === '[object Array]' && (typeof msg.data[0] === 'string')) {
            const msgKey = msg.data[0];
            if (msgKey === 'serverping') {
              // keepalive: respond to the server's ping
              this.marketSocket.next(2);
            } else if ((this.MESSAGE_HANDLERS[msgKey] !== undefined) && (typeof msg.data[1] === 'string')) {
              try {
                this.MESSAGE_HANDLERS[msgKey].next(JSON.parse(msg.data[1]));
              } catch (e) {
                // error parsing message data: invalid message received so ignoring it
              }
            }

          }
        },
        (err) => this.log.er('websocket connection errored: ', err),
        () => {
          this.log.i('websocket connection closed');
          this.stopMessageListeners();
        }
      );
    }

  }


  private stopMessageListeners() {
    const msgKeys = Object.keys(this.MESSAGE_HANDLERS);

    for (const key of msgKeys) {
      const sub = this.MESSAGE_HANDLERS[key];
      if (sub !== null) {
        try {
          sub.complete();
        } catch (e) { }
        this.MESSAGE_HANDLERS[key] = null;
      }
    }
  }


  private setupMessageListeners() {

    this.stopMessageListeners();

    this.MESSAGE_HANDLERS = {
      MPA_LISTING_ADD_03: new Subject<SocketMessages_v03.AddListing>()
    };
  }

}
