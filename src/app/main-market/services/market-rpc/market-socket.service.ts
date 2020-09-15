import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, Subject, empty, of } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

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
export class MarketSocketService implements OnDestroy {

  private log: any = Log.create('market-socket.service id:' + Math.floor((Math.random() * 1000) + 1));

  private marketSocket: WebSocketSubject<SocketDataObject | number> = null;

  private MESSAGE_HANDLERS: SocketMessageHandlers = {
    MPA_LISTING_ADD_03: null,
    MPA_COMMENT_ADD: null,
    MPA_PROPOSAL_ADD: null,
    MPA_BID_03: null
  };


  constructor() {
    this.log.d('starting service...');
  }


  ngOnDestroy() {
    /**
     * NB!! this service is registered in ngxs and thus is not destroyed when the market module is destroyed.
     *
     * Thus, due to current app structure, this only occurs when the app shuts down or is destroyed
     * (after having launched the MP at least once)
     *  However, this needs to exist for dev purposes: when reloading the window via hot-reload functionality, the websocket needs to be
     * closed correctly, since the MP service is not stopped, so the socket connection remains open
     * (despite the UI losing the connection due to the reload)
     */
    this.stopSocketService();
  }


  startSocketService(socketpath: string): Observable<boolean> {
    if (this.marketSocket === null || this.marketSocket.closed) {
      this.setupWebSocket(socketpath);
      this.setupMessageListeners();
    }
    return of(this.marketSocket.closed || this.marketSocket.hasError);
  }


  stopSocketService() {
    // TODO: zaSmilingIdiot: 2020-09-14 unfortunately, there's a somewhat of a race condition that exists here, which needs to be fixed
    // The call to `this.marketSocket.complete();` takes some time to complete (possibly different thread) so the method may complete
    //  before the connection is properly closed. However, this is method call is typically followed by a close of the market server, which
    //  terminates the market process... if that executes quicker than the completion of the socket completion, an error occurs since the
    //  socket frm the extneral server is immediately shutdown without any chance to clean up itself.

    // stop the websocket
    if (this.marketSocket !== null) {
      try {
        this.marketSocket.complete();
        this.marketSocket = null;
      } catch (err) {
        this.log.er('websocket completion failed: ', err);
      }
    }
    // stop all the listeners
    this.stopMessageListeners();
  }


  getSocketMessageListener<K extends keyof SocketMessageListeners>(msgType: K): SocketMessageListeners[K] {
    return (this.MESSAGE_HANDLERS[msgType] === null) ?
      empty() :
      this.MESSAGE_HANDLERS[msgType].asObservable() as SocketMessageListeners[K];
  }


  private setupWebSocket(url: string): void {

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

    this.marketSocket.subscribe(
      (msg: SocketDataObject) => {
        if (Array.isArray(msg.data) && (typeof msg.data[0] === 'string')) {
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


  private stopMessageListeners() {
    const msgKeys = Object.keys(this.MESSAGE_HANDLERS);

    for (const key of msgKeys) {
      const sub = this.MESSAGE_HANDLERS[key];
      if (sub !== null) {
        try {
          sub.complete();
        } catch (err) {
          this.log.er(`error stopping socket message handler ${key}: `, err);
        }
        this.MESSAGE_HANDLERS[key] = null;
      }
    }
  }


  private setupMessageListeners() {
    // unnecessary to be in separate function call, but makes it easy for adding/modiyfing/deleting message handlers

    this.stopMessageListeners();

    this.MESSAGE_HANDLERS = {
      MPA_LISTING_ADD_03: new Subject<SocketMessages_v03.AddListing>(),
      MPA_COMMENT_ADD: new Subject<SocketMessages_v03.CommentAdded>(),
      MPA_PROPOSAL_ADD: new Subject<SocketMessages_v03.ProposalAdded>(),
      MPA_BID_03: new Subject<SocketMessages_v03.BidReceived>(),
    };
  }

}
