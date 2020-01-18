import {
  State,
  StateToken,
  NgxsOnInit,
  createSelector,
  Action,
  StateContext
} from '@ngxs/store';
import { ZmqConnectionStateModel, ZmqTypeField, ZmqActions } from './app.models';
import { ZMQ } from './app.actions';
import { ZmqService } from '../services/zmq.service';


const ZMQ_CONNECTION_TOKEN = new StateToken<ZmqConnectionStateModel>('zmq');


@State<ZmqConnectionStateModel>({
  name: ZMQ_CONNECTION_TOKEN,
  defaults: {
    hashblock: {
      data: null,
      status: {
        connected: false,
        retryCount: 0,
        error: false
      }
    },
    smsg: {
      data: null,
      status: {
        connected: false,
        retryCount: 0,
        error: false
      }
    }
  }
})
export class ZmqConnectionState implements NgxsOnInit {


  static get(field: string) {
    return createSelector(
      [ZmqConnectionState],
      (state: ZmqConnectionStateModel) => {
        return state[field];
      }
    );
  }

  static getStatus(field: string) {
    return createSelector(
      [ZmqConnectionState],
      (state: ZmqConnectionStateModel) => {
        return field in state ? state[field].status : null;
      }
    );
  }


  constructor(
    private _zmq: ZmqService
  ) {}

  ngxsOnInit() {
    this._zmq.listen();
  }


  @Action(ZMQ.UpdateStatus)
  updateStatusValue(ctx: StateContext<ZmqConnectionStateModel>, action: ZMQ.UpdateStatus) {

    const current = ctx.getState();
    if (!(action.field in current)) {
      return;
    }

    const fieldValues = JSON.parse(JSON.stringify(current[action.field])) as ZmqTypeField;

    switch (action.action) {
      case ZmqActions.CONNECTED:
        fieldValues.status.connected = true;
        fieldValues.status.retryCount = 0;
        fieldValues.status.error = false;
        break;

      case ZmqActions.CLOSED:
        fieldValues.status.connected = false;
        fieldValues.status.retryCount = 0;
        fieldValues.status.error = false;
        break;

      case ZmqActions.ERROR:
        fieldValues.status.retryCount = 0;
        fieldValues.status.error = true;
        break;

      case ZmqActions.RETRY:
        fieldValues.status.connected = false;
        fieldValues.status.retryCount = action.value;
        break;

      case ZmqActions.DATA:
        fieldValues.status.error = false;
        fieldValues.data = action.value;
        break;
    }

    const patch = {};
    patch[action.field] = fieldValues;

    ctx.patchState(patch);
  }
}
