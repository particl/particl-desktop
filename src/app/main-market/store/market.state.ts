import { State, StateToken, Action, StateContext, Selector } from '@ngxs/store';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MarketService } from '../services/market-rpc/market.service';
import { MarketActions } from './market.actions';
import { MarketStateModel, StartedStatus } from './market.models';


const MARKET_STATE_TOKEN = new StateToken<MarketStateModel>('market');


@State<MarketStateModel>({
  name: MARKET_STATE_TOKEN,
  defaults: {
    started: StartedStatus.STOPPED
  }
})
export class MarketState {

  @Selector()
  static startedStatus(state: MarketStateModel) {
    return state.started;
  }

  constructor(
    private _marketService: MarketService
  ) {}


  @Action(MarketActions.StartMarketService)
  startMarketServices(ctx: StateContext<MarketStateModel>) {
    if ([StartedStatus.PENDING, StartedStatus.STARTED].includes(ctx.getState().started)) {
      return;
    }

    ctx.patchState({started: StartedStatus.PENDING});

    return this._marketService.startMarketService().pipe(
      tap((isStarted: boolean) => {
        ctx.patchState({started: isStarted ? StartedStatus.STARTED : StartedStatus.STOPPED});
      }),
      catchError((err) => {
        ctx.patchState({started: StartedStatus.FAILED});
        return of({});
      })
    );
  }


  @Action(MarketActions.StopMarketService)
  stopMarketServices(ctx: StateContext<MarketStateModel>) {
    this._marketService.stopMarketService();
    ctx.patchState({started: StartedStatus.STOPPED});
  }
}
