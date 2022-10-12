import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Log } from 'ng2-logger';
import { Observable, Subject, timer, EMPTY } from 'rxjs';
import { takeWhile, takeUntil, switchMap, scan, mapTo, map, tap } from 'rxjs/operators';
import { Particl } from 'app/networks/networks.module';


@Component({
  selector: 'main-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnDestroy, AfterViewInit {

  @Select(Particl.State.Wallet.Info.getValue('unlocked_until')) unlockedUntil$: Observable<number>;

  private log: any = Log.create('countdown-timer.component id: ' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();

  private _unlockedUntil: number = 0;
  private _remaining: number = 0;


  constructor() {
    this.log.d('initializing');
  }

  ngAfterViewInit() {
    this.unlockedUntil$.pipe(

      tap((val) => {
        this._unlockedUntil = val;
      }),

      map((val) => val > 0),

      switchMap(doCountdown => {
        return !doCountdown ? EMPTY : timer(0, 1000).pipe(
          mapTo(-1),
          scan(
            (acc, curr) => {
              return (curr ? curr + acc : acc);
            },
            Math.floor(this._unlockedUntil - Math.floor((new Date()).getTime() / 1000))
          ),
          takeWhile(diff => diff >= 0)
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe(
      (val) => {
        this._remaining = val;
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  // @TODO: zaSmilingIdiot 2020-01-19 -> should probably be implemented instead as a pipe
  get timeRemaining(): string {
    if (this._remaining <= 0) {
      return '00:00';
    }
    const hours = Math.floor(this._remaining / 3600);
    const min = Math.floor((this._remaining % 3600) / 60);
    const sec = Math.ceil((this._remaining % 3600 % 60) );
    return (hours > 0 ? `${hours}:` : '') +
      (hours > 0 && min < 10 ? `0${min}:` : `${min}:`) +
      ('0' + sec).slice(-2);
  }
}
