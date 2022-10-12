import { StateToken } from '@ngxs/store';
import { ApplicationConfigStateModel } from './app-global-state/state.models';

export const APP_STATE_TOKEN = new StateToken<{}>('application');
export const APP_CONFIG_STATE_TOKEN = new StateToken<ApplicationConfigStateModel>('config');
