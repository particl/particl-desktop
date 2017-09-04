import * as chainstate from './chain-state.actions';

export interface ChainState {
  state: { [key: string]: any };
}

export function reducer(
  state: ChainState,
  action: chainstate.Action
): ChainState {
  switch (action.type) {
    case chainstate.UPDATE_STATE: {
      const newState: ChainState = Object.assign({}, state, action.payload);

      if (JSON.stringify(newState) === JSON.stringify(state)) {
        return state;
      }

      return newState;
    }
    default:
      return state;
  }
}

export const getPairs = (state: ChainState) => state.state;
export const getKeys = (state: ChainState) => Object.keys(state.state);
