import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { MotdService, MessageQuote } from 'app/core/services/motd.service';
import { BackendService } from 'app/core/services/backend.service';

import { termsObj } from 'app/startup/terms/terms-txt';

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {

  loadingMessage: string = '';
  hasError: boolean = false;
  motd: MessageQuote = {author: '', text: ''};

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _router: Router,
    private _motdService: MotdService,
    private _backendService: BackendService,
  ) { }

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
      this._router.navigate(['loading', 'terms']);
      return;
    }

    this._router.navigate(['/main/extra/welcome']);
  }
}
