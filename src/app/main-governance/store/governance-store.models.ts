import { ProposalItem } from "../base/governance.models";


export interface GovernanceStateModel {
  blockCount: number;
  blockchainSynced: boolean;
  isPolling: boolean;
  lastRequestErrored: boolean;
  proposals: ProposalItem[];
}
