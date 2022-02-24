import {
  State,
  StateToken,
  NgxsOnInit,
  createSelector,
  Action,
  StateContext
} from '@ngxs/store';
import { ZmqConnectionStateModel, ZmqTypeField, ZmqActions, ZmqFieldStatus } from './app.models';
import { ZMQ } from './app.actions';
import { ZmqService } from '../services/zmq.service';
import { patch } from '@ngxs/store/operators';


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
    },
    hashtx: {
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
      (state: ZmqConnectionStateModel): ZmqTypeField => {
        return state[field];
      }
    );
  }


  static getData(field: string) {
    return createSelector(
      [ZmqConnectionState.get(field)],
      (fieldData: ZmqTypeField): string => {
        return fieldData ? fieldData.data : null;
      }
    );
  }


  static getStatus(field: string) {
    return createSelector(
      [ZmqConnectionState],
      (state: ZmqConnectionStateModel): ZmqFieldStatus | null => {
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

    switch (action.action) {
      case ZmqActions.CONNECTED:
        ctx.setState(patch<ZmqConnectionStateModel>({
          [action.field]: patch<ZmqTypeField>({
            status: patch<ZmqFieldStatus>({
              connected: true,
              retryCount: 0,
              error: false,
            }),
          })
        }));
        break;

      case ZmqActions.CLOSED:
        ctx.setState(patch<ZmqConnectionStateModel>({
          [action.field]: patch<ZmqTypeField>({
            status: patch<ZmqFieldStatus>({
              connected: false,
              retryCount: 0,
              error: false,
            }),
          })
        }));
        break;

      case ZmqActions.ERROR:
        ctx.setState(patch<ZmqConnectionStateModel>({
          [action.field]: patch<ZmqTypeField>({
            status: patch<ZmqFieldStatus>({
              retryCount: 0,
              error: true,
            }),
          })
        }));
        break;

      case ZmqActions.RETRY:
        ctx.setState(patch<ZmqConnectionStateModel>({
          [action.field]: patch<ZmqTypeField>({
            status: patch<ZmqFieldStatus>({
              connected: false,
              retryCount: +action.value,
            }),
          })
        }));
        break;

      case ZmqActions.DATA:
        ctx.setState(patch<ZmqConnectionStateModel>({
          [action.field]: patch<ZmqTypeField>({
            status: patch<ZmqFieldStatus>({
              connected: true,
              error: false,
            }),
            data: action.value
          })
        }));
        break;
    }
  }
}
