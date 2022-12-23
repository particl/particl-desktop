import { ChainType } from 'app/networks/particl/particl.models';
import { ProposalItem } from '../base/governance.models';



export namespace GovernanceStateActions {

  export class ResetState {
    static readonly type: string = '[Governance State] Reset State';
  }

  export class SetProposals {
    static readonly type: string = '[Governance State] Set Proposals';
    constructor(public proposals: ProposalItem[]) {}
  }

  export class SetRetrieveFailedStatus {
    static readonly type: string = '[Governance State] Set Last Retrieve Failed Status';
    constructor(public status: boolean) {}
  }


  export class SetPollingStatus {
    static readonly type: string = '[Governance State] Set Polling Status';
    constructor(public status: boolean) {}
  }


  export class SetBlockValues {
    static readonly type: string = '[Governance State] Set Block Values';
    constructor(public blockCount: number, public percentComplete: number, public chainType: ChainType) {}
  }

}
