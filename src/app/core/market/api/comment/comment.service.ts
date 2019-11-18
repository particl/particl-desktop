import { Injectable, EventEmitter } from '@angular/core';
import { Observable, interval, timer, fromEvent } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';

import { switchMap, switchMapTo, map, startWith } from 'rxjs/operators';

@Injectable()
export class CommentService {
  private log: any = Log.create('comment.service id:' + Math.floor((Math.random() * 1000) + 1));
  constructor(
    private market: MarketService
  ) {}

  watchCommentCount(type: string, target: string, parentCommentHash: string, refresh: Observable<any>): Observable<any> {

    const params = [
      'count',
      type,
      target,
      parentCommentHash
    ];

    return refresh.pipe(
      startWith(null),
      switchMap(() => this.market.call('comment', params))
    );
  }

  watch(page: number, pageLimit: number, type: string, target: string,
        parentCommentHash: string, refresh: Observable<any>):
    Observable<any> {

    const params = [
        'search',
        page,
        pageLimit,
        'DESC',
        'created_at',
        type,
        target,
        parentCommentHash,
        true
        ];

    return refresh.pipe(
      startWith(null),
      switchMap(() => this.market.call('comment', params))
    );
  }

  get(id: number | string) {
    return this.market.call('comment', ['get', id]);
  }

  post(profileId: number | string, receiver: string, type: string, target: string, message: string, parent?: string) {

    const params = [
      'post',
      profileId,
      receiver,
      type,
      target,
      message,
      ];

    if (parent) {
      params.push(parent);
    }

    return this.market.call('comment', params);
  }

}
