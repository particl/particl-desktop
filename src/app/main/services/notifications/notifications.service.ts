import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IpcService } from 'app/core/services/ipc.service';


@Injectable()
export class NotificationsService {

  constructor(private _ipc: IpcService) { }

  notify(title: string, description: string): Observable<boolean> {
    // very simple implementation: can be later modified to add grouped notifications over a period of time
    //  (so as not to spam the user with notifications)
    return defer(() => this._ipc.runCommand('notifications', null, title, description || '').pipe(
      catchError((err) => of(false))
    ));
  }

}
