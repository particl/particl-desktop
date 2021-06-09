
export type CHAIN_TYPE = 'main' | 'test';


export interface ResponseProposalDetail {
  blockheight_end: number;
  blockheight_start: number;
  "link-ccs": string;
  "link-github": string;
  name: string;
  network: 'mainnet' | 'testnet';
  proposalid: number;
  version: number;
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
}