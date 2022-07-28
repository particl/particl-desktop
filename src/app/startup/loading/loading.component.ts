import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Subject, merge } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { MotdService, MessageQuote } from 'app/core/services/motd.service';
import { BackendService } from 'app/core/services/backend.service';

import { environment } from 'environments/environment';
import { termsObj } from 'app/startup/terms/terms-txt';

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {

  public readonly clientVersion: string = environment.version;

  loadingMessage: string = '';
  hasError: boolean = false;
  motd: MessageQuote = {author: '', text: ''};

  private destroy$: Subject<void> = new Subject();
  private log: any = Log.create('loading.component');

  constructor(
    private _router: Router,
    private _motdService: MotdService,
    private _backendService: BackendService,
  ) {
    this.log.i('loading component initialized');
  }

  ngOnInit() {

    merge(
      this._backendService.sendAndWait<string>('init-system').pipe(
        finalize(() => {
          if (!this.hasError) {
            this.getNextRoute();
          }
        }),
        tap(msg => this.loadingMessage = msg),
        catchError((err: string) => {
          this.loadingMessage = err;
          this.hasError = true;
          return err;
        }),
        takeUntil(this.destroy$)
      ),

      this._motdService.motd.pipe(
        tap((motd) => this.motd = motd),
        takeUntil(this.destroy$)
      )
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getNextRoute() {
    const termsVersion = JSON.parse(localStorage.getItem('terms'));
    if (!termsVersion ||
        ((termsVersion.createdAt !== termsObj.createdAt) || (termsVersion.text !== termsObj.text))
    ) {
      this.log.d('Going to terms');
      this._router.navigate(['loading', 'terms']);
      return;
    }

    this._router.navigate(['/main/extra/welcome']);
  }
}
