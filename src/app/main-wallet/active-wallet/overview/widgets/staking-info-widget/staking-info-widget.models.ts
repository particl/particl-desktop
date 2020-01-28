
export interface RpcGetStakingInfo {
  enabled: boolean;
  staking: boolean;
  errors: string;
  percentyearreward: number;
  moneysupply: number;
  foundationdonationpercent: number;
  currentblocksize: number;
  currentblocktx: number;
  pooledtx: number;
  difficulty: number;
  lastsearchtime: number;
  weight: number;
  netstakeweight: number;
  expectedtime: number;
}
