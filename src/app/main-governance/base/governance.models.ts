import { CHAIN_TYPE } from 'app/core/core.models';


export interface ResponseProposalDetail {
  blockheight_end: number;
  blockheight_start: number;
  "link-ccs": string;
  "link-github": string;
  link?: string;
  name: string;
  network: 'mainnet' | 'testnet';
  proposalid: number;
  version: number;
}


export interface ResponseTallyVote {
  proposal : number;        // The proposal id
  option? : number;          // The option marked
  height_start : number;    // The starting chain height
  height_end : number;      // The ending chain height
  blocks_counted : number;  // The ending chain height
  // NB! Any other data presented here represents voted tallied options of the form: "Option x": total, %,(string) // The number of votes cast for option x.
}


export interface ResponseVoteHistory {
  proposal: number;
  option: number;
  from_height: number;
  to_height: number;
}


export interface ResponseSetVote {
  result: string;
  from_height: number;
  to_height: number;
}


export interface ProposalItem {
  proposalId: number;
  name: string;
  blockStart: number;
  blockEnd: number;
  network: CHAIN_TYPE;
  infoUrls: {
    ccs?: string;
    github?: string;
  };
  voteCast: number | null;
}


export interface TalliedVotes {
  proposalId: number;
  blocksCounted: number;
  votes: {
    label: string;
    votes: number;
  }[];
}


export interface VoteHistoryItem {
  proposalId: number;
  voteCast: number;
}