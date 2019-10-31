
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

  url: string = `http://${this.hostname}:${this.port}`;

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

    return this._http.post(this.url, postData, { headers: headers });
  }

  search(page: number, pageLimit: number, type: string, search: string, enabled: boolean): Promise<Array<Bot>> {
    const params = [
      page,
      pageLimit,
      type,
      search,
      enabled
    ];

    return this.call('search', params).pipe(
      map(bots => bots.map(b => new Bot(b)))
    ).toPromise();
  }

  command(address: string, command: string, ...args: any[]): Observable<any> {

    const params = [
      address,
      command,
    ].concat(args);

    return this.call('command', params).pipe(
      take(1)
    );
  }

  enable(botAddress: string): Promise<Bot> {
    return this.call('enable', [botAddress]).pipe(
      map(bot => new Bot(bot))
    ).toPromise();
  }

  disable(botAddress: string): Promise<Bot> {
    return this.call('disable', [botAddress]).pipe(
      map(bot => new Bot(bot))
    ).toPromise();
  }

  searchExchanges(page: number, pageLimit: number, bot: string, from: string, to: string, search: string): Promise<any> {
    const params = [
      page,
      pageLimit,
      bot,
      from,
      to,
      search
    ];

    return this.call('exchanges', params).toPromise();
  }

  uniqueExchangeData(): Promise<any> {
    return this.call('uniqueExchangeData', []).toPromise();
  }

  startBotManager(wallet: string) {
    if (window.electron) {
      this._ipc.runCommand('start-bot-framework', null, wallet);
    }
  }

  stopBotManager() {
    if (window.electron) {
      this._ipc.runCommand('stop-bot-framework', null, null);
    }
  }
}
