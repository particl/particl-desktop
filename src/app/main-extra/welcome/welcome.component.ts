import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { MotdService, MessageQuote } from 'app/core/services/motd.service';
import { Select } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';


@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnDestroy {

  @Select(ApplicationConfigState.moduleVersions('app')) clientVersion$: Observable<string>;
  motd: MessageQuote = {author: '', text: ''};

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _motdService: MotdService,
  ) {
    this._motdService.motd.pipe(
      tap((motd) => this.motd = motd),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
