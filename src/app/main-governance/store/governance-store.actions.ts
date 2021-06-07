import { ProposalItem } from "../base/governance.models";



export namespace GovernanceStateActions {

  export class ResetState {
    static readonly type: string = '[Governance State] Reset State';
  }

  // export class SetProposals {
  //   static readonly type: string = '[Governance State] Set Proposals';
  //   constructor(public proposals: ProposalItem[]) {}
  // }

  export class SetRetrieveFailedStatus {
    static readonly type: string = '[Governance State] Set Last Retrieve Failed Status';
    constructor(public status: boolean) {}
  }

}
