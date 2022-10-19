import { ChainType } from 'app/networks/particl/particl.models';
import { ProposalItem } from '../base/governance.models';


export interface GovernanceStateModel {
  blockCount: number;
  blockchainSynced: boolean;
  chain: ChainType;
  isPolling: boolean;
  lastRequestTime: number;
  lastRequestErrored: boolean;
  proposals: ProposalItem[];
}
