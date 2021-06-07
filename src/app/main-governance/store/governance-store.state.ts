import { State, StateToken, StateContext, Action } from '@ngxs/store';
import {  } from 'rxjs';
import {  } from 'rxjs/operators';
// import { MainActions } from 'app/main/store/main.actions';
import { GovernanceStateActions } from './governance-store.actions';

import { GovernanceStateModel } from './governance-store.models';


const DEFAULT_STATE_TOKEN = new StateToken<GovernanceStateModel>('governance');


const DEFAULT_STATE_VALUES: GovernanceStateModel = {
  isPolling: false,
  lastRequestErrored: false,
  proposals: []
};


@State<GovernanceStateModel>({
  name: DEFAULT_STATE_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES))
})
export class GovernanceState {

  /**
     * NB!!!! Once this state is loaded into the global store, it remains there permanently through the running of the application.
     * Which means:
     *
     * 1. Keep this as light-weight as possible:
     *    - do not store anything here that is not imperative for the general operation of this module;
     *    - make certain that there is exactly that which is needed (if certain circumstances require additional info, load it as needed);
     *    - if in doubt, don't store it;
     *    - ensure that there is nothing sensitive left in as part of the default store state.
     *
     * 2. If using ngxsOnInit(), remember that it is called only the first time the state is added to the global store!
     *    - So despite this module potentially being "loaded" multiple times (on each new init of the module),
     *      this function will only execute on the 1st load of the module.
     *    - for clean separation, we should be bootstrapping this module as another whole app inside the main application...
     *      We'll get to such a goal eventually... or at least that's the current forward direction.
     */

  constructor() {}


  @Action(GovernanceStateActions.ResetState)
  updatePollingStatus(ctx: StateContext<GovernanceStateModel>) {
    ctx.setState(JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES)));
  }


  @Action(GovernanceStateActions.SetRetrieveFailedStatus)
  updateRequestFailedStatus(ctx: StateContext<GovernanceStateModel>, { status }: GovernanceStateActions.SetRetrieveFailedStatus) {
    ctx.patchState({ lastRequestErrored: !!status });
  }

}
