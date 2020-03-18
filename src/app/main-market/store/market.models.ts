
export enum StartedStatus {
  PENDING,
  STARTED,
  FAILED,
  STOPPED
}


export interface MarketStateModel {
  started: StartedStatus;
}
