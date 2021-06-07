import { ProposalItem } from "../base/governance.models";


export interface GovernanceStateModel {
  isPolling: boolean;
  lastRequestErrored: boolean;
  proposals: ProposalItem[];
}
