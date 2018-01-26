import { Observable } from 'rxjs';

export type IpcListener = (event: Event, ...args: any[]) => void;

export type ObservableFactoryFunction = (...args: any[]) => Observable<any>;

export interface Receiver {
  send(channel: string, ...args: any[]): void;
}

// TODO: does it really extend Event?
export interface ListenerEvent extends Event {
  sender: any;
}