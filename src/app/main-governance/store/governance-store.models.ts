import { CHAIN_TYPE } from 'app/core/core.models';
import { ProposalItem } from "../base/governance.models";


export interface GovernanceStateModel {
  blockCount: number;
  blockchainSynced: boolean;
  chain: CHAIN_TYPE;
  isPolling: boolean;
  lastRequestTime: number;
  lastRequestErrored: boolean;
  proposals: ProposalItem[];
}
