import { Injectable } from '@angular/core';
import { BackendService } from 'app/core/services/backend.service';


@Injectable()
export class NotificationsService {

  constructor(private _backendService: BackendService) { }

  notify(title: string, description: string, onlyShowWhenUnfocused: boolean = true): void {
    // very simple implementation: can be later modified to add grouped notifications over a period of time
    //  (so as not to spam the user with notifications)
    this._backendService.send('gui:notification:notifications', title, description || '', onlyShowWhenUnfocused)
  }

}
