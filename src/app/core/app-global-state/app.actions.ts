
export namespace GlobalActions {

  export class Initialize {
    static readonly type: string = '[GlobalActions] Initialize';
  }


  export class SetSetting {
    static readonly type: string = '[GlobalActions] Set Setting';
    constructor(public key: string, public newvalue: any) {}
  }

}
