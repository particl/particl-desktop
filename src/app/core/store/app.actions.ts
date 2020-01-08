import { CoreConnectionModel, APP_MODE } from './app.models';

export namespace Global {

  export class Initialize {
    static readonly type: string = '[Application] Initialize';
  }

  export class Connected {
    static readonly type: string = '[Application] Connected';
    constructor(public config: CoreConnectionModel) {}
  }

  export class SetLoadingMessage {
    static readonly type: string = '[Application] Set Loading Message';
    constructor(public message: string) {}
  }

  export class ChangeMode {
    static readonly type: string = '[Application] Change App Mode';
    constructor(public mode: APP_MODE | null) {}
  }
}
