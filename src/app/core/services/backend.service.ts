import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';


@Injectable(
  {providedIn: 'root'}
)
export class BackendService {

  /* Listeners on the renderer */
  private listenerCount: number = 0;

  constructor(private _zone: NgZone) { }


  send(channel: string, ...args: any[]): void {
    if (!this.isElectronBackend()) {
      return;
    }
    window.electronAPI.send(channel, ...args);
  }


  sendAndWait<T>(channel: string, ...args: any[]): Observable<T> {
    if (!this.isElectronBackend()) {
      return EMPTY;
    }

    const replyChannel = `${channel}:${this.listenerCount++}`;

    window.electronAPI.sendAndWait(channel, replyChannel, ...args);

    return new Observable(observer => {
      window.electronAPI.listen(replyChannel, (type: string, response: T) => {
        this._zone.run(() => {
          if (typeof type === 'string') {
            switch (type) {
            case 'obs_next': observer.next(response); break;
            case 'obs_error': observer.error(response); break;
            case 'obs_complete': observer.complete(); break;
            default:
            }
          }
        });
      });

      return () => {
        window.electronAPI.removeListener(replyChannel);
      }
    });

  }

  private isElectronBackend(): boolean {
    return !!(window.electronAPI && window.electronAPI.electron);
  }

}
