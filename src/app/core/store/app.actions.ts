import { CoreConfig } from './app.models';

export namespace Global {

  export class Initialize {
    static readonly type: string = '[Application] Initialize';
  }

  export class Connected {
    static readonly type: string = '[Application] Connected';
    constructor(public config: CoreConfig) {}
  }

  export class SetLoadingMessage {
    static readonly type: string = '[Application] Set Loading Message';
    constructor(public message: string) {}
  }
}
