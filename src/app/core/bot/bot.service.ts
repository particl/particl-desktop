
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';

import { environment } from '../../../environments/environment';
import { IpcService } from 'app/core/ipc/ipc.service';
import { map, take } from 'rxjs/operators';
import { Bot } from './bot.model';

@Injectable()
export class BotService {

  private log: any = Log.create('bot-service id: ' + Math.floor((Math.random() * 1000) + 1));

  hostname: string = environment.botHost;
  port: number = environment.botPort;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService
  ) { }

  public call(method: string, params?: Array<any> | null): Observable<any> {
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
    const headers = new HttpHeaders(headerJson);

    return this._http.post(`http://${this.hostname}:${this.port}`, postData, { headers: headers });
  }

  search(page: number, pageLimit: number, type: string, search: string, enabled: boolean): Promise<Array<Bot>> {
    const params = [
      'search',
      page,
      pageLimit,
      type,
      search,
      enabled
    ];

    return this.call('bot', params).pipe(
      map(bots => bots.map(b => new Bot(b)))
    ).toPromise();
  }

  command(address: string, command: string, ...args: any[]): Observable<any> {

    const params = [
      'command',
      address,
      command,
    ].concat(args);

    return this.call('bot', params).pipe(
      take(1)
    );
  }

  enable(botAddress: string): Promise<Bot> {
    return this.call('bot', ['enable', botAddress]).pipe(
      map(bot => new Bot(bot))
    ).toPromise();
  }

  disable(botAddress: string): Promise<Bot> {
    return this.call('bot', ['disable', botAddress]).pipe(
      map(bot => new Bot(bot))
    ).toPromise();
  }

  searchExchanges(page: number, pageLimit: number, bot: string, from: string, to: string,
                  search: string, completed: boolean, cancelled: boolean): Promise<any> {
    const params = [
      'search',
      page,
      pageLimit,
      bot,
      from,
      to,
      search,
      completed,
      cancelled
    ];

    return this.call('exchange', params).toPromise();
  }

  cancelExchange(track_id: string): Promise<Bot> {
    return this.call('exchange', ['cancel', track_id]).toPromise();
  }

  uniqueExchangeData(): Promise<any> {
    return this.call('exchange', ['uniqueExchangeData']).toPromise();
  }

  startBotManager(wallet: string, port: number) {
    if (window.electron) {
      if (typeof port === 'number' && port !== this.port) {
        this.port = port;
      }
      this._ipc.runCommand('start-bot-framework', null, wallet, port);
    }
  }

  stopBotManager() {
    if (window.electron) {
      this._ipc.runCommand('stop-bot-framework', null, null);
    }
  }
}
