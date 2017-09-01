import { Action } from '@ngrx/store';

export const UPDATE_STATE = '[ChainState] Update State';

export class UpdateStateAction implements Action {
  readonly type: string = UPDATE_STATE;

  constructor(public payload: any) {}
}

export type Action =
  | UpdateStateAction;
