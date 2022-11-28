import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { defer, forkJoin, iif, Observable, of, Subject, merge, timer } from 'rxjs';
import { tap, takeUntil, filter, concatMap, map, mergeMap, catchError, delay, repeat, retryWhen, delayWhen } from 'rxjs/operators';
import { xorWith } from 'lodash';

import { PartoshiAmount } from 'app/core/util/utils';
import { BackendService } from 'app/core/services/backend.service';
import { RpcService } from './rpc.service';
import { ParticlWalletService } from './wallet.service';

import {
  NETWORK_PARTICL_STATE_TOKEN,
  NETWORK_PARTICL_ZMQ_STATE_TOKEN,
  NETWORK_PARTICL_BLOCKCHAIN_TOKEN,
  NETWORK_PARTICL_WALLET_TOKEN,
  NETWORK_PARTICL_WALLET_UTXOS_TOKEN,
  NETWORK_PARTICL_WALLET_STAKING_TOKEN,
} from '../networks.tokens';
import {
  DEFAULT_PARTICL_BLOCKCHAIN_STATE,
  DEFAULT_STAKING_INFO_STATE,
  DEFAULT_WALLET_STATE,
  DEFAULT_UTXOS_STATE,
  RunningStatus,
  IPCResponses,
  ParticlCoreStateModel,
  ParticlZMQStateModel,
  ParticlBlockchainStateModel,
  WalletInfoStateModel,
  WalletStakingStateModel,
  WalletBalanceStateModel,
  PublicUTXO,
  BlindUTXO,
  AnonUTXO,
  RPCResponses,
  ChainType,
} from './particl.models';
import { GlobalActions } from 'app/core/app-global-state/app.actions';


namespace ParticlInternalActions {
  export class UpdateStatus {
    static readonly type: string = '[ParticlInternalActions] Update Status';
    constructor(public settings: IPCResponses.CoreManager.Events.ParticlStatus) {}
  }

  export class UpdateZMQ {
    static readonly type: string = '[ParticlInternalActions] Update ZMQ';
    constructor(public message: IPCResponses.CoreManager.Events.ParticlZMQ) {}
  }

  export class BlockchainStarted {
    static readonly type: string = '[ParticlInternalActions] Blockchain Started';
  }

  export class BlockchainStopped {
    static readonly type: string = '[ParticlInternalActions] Blockchain Stopped';
  }

  export namespace WalletActions {

    // export class ChangeSmsgWallet {
    //   static readonly type: string = '[ParticlInternalActions Wallet] Change Smsg Active Wallet';
    //   constructor(public walletname: string) {}
    // }

    export class WalletLoaded {
      static readonly type: string = '[ParticlInternalActions Wallet] New Wallet Loaded';
      constructor(public walletName: string | null, public isInitialized: boolean) {}
    }
  }
}


export namespace ParticlActions {

  export class RequestAction {
    static readonly type: string = '[ParticlActions] Request Action';
    constructor(public action: 'initialize' | 'start' | 'stop') {}
  }


  export namespace WalletActions {

    export class ChangeWallet {
      static readonly type: string = '[Particl Wallet Actions] Change To Wallet';
      constructor(public wallet: string) {}
    }

    export class RefreshWalletInfo {
      /**
       * Request an update of the base wallet model data only:
       *  specifically for requesting a refresh of the wallet specific data (eg: initialization, encryption statuses).
       */
      static readonly type: string = '[Particl Wallet Actions] Refresh Wallet Info Only';
    }

    export class ResetWallet {
      /**
       * Reset the active wallet state to a default blank one.
       */
      static readonly type: string = '[Particl Wallet Actions] Reset Wallet';
    }

    export class UpdateColdStakingInfo {
      static readonly type: string = '[Particl Wallet Actions] Update Cold Staking Info';
    }

    export class RefreshBalances {
      static readonly type: string = '[Particl Wallet Actions] Refresh Balances';
    }

  }

}




@State({
  name: NETWORK_PARTICL_STATE_TOKEN,
  defaults: {
    statusListening: false,
    running: RunningStatus.STOPPED,
    statusMessage: '',
    url: '',
    auth: '',
    hasError: false,
    zmqServices: {},
    version: ''
  },
})
@Injectable()
export class ParticlCoreState {

  @Selector([ParticlCoreState])
  private static _getStatusMessage (state: ParticlCoreStateModel) {
    return state.statusMessage;
  };

  @Selector([ParticlCoreState])
  private static _getStartedStatus (state: ParticlCoreStateModel) {
    return state.running;
  };

  @Selector([ParticlCoreState])
  private static _getzmqServices (state: ParticlCoreStateModel) {
    return state.zmqServices;
  };


  @Selector([ParticlCoreState._getStatusMessage])
  static getStatusMessage(statusMessage: string) {
    return statusMessage;
  }

  @Selector([ParticlCoreState._getStartedStatus])
  static getStartedStatus(started: RunningStatus) {
    return started;
  }

  @Selector([ParticlCoreState])
  static version (state: ParticlCoreStateModel) {
    return state.version;
  }

  static isRunning() {
    return createSelector(
      [ParticlCoreState._getStartedStatus],
      (startedStatus: RunningStatus): boolean => {
        return startedStatus === RunningStatus.STARTED;
      }
    );
  }


  static isZmqConnected(field: string) {
    return createSelector(
      [ParticlCoreState._getzmqServices],
      (zmqServices: {[key: string]: string}): boolean => {
        return field in zmqServices;
      }
    );
  }


  private IPCSettingsToStateMap: {
    [K in keyof IPCResponses.CoreManager.Events.ParticlStatus]: keyof ParticlCoreStateModel
  } = {
    url: 'url',
    auth: 'auth',
    started: 'running',
    hasError: 'hasError',
    message: 'statusMessage',
    zmq: 'zmqServices',
    version: 'version',
  };


  private destroy$: Subject<void> = new Subject();


  constructor(private _backendService: BackendService) { }


  @Action(ParticlInternalActions.UpdateStatus)
  updateConnectionStatus(ctx: StateContext<ParticlCoreStateModel>, { settings }: ParticlInternalActions.UpdateStatus) {
    if (!settings) {
      return;
    }
    const currentState = ctx.getState();
    const patchable: Partial<ParticlCoreStateModel> = {};
    Object.keys(this.IPCSettingsToStateMap).forEach(k => {
      if (typeof settings[k] === typeof currentState[this.IPCSettingsToStateMap[k]]) {
        if (typeof currentState[this.IPCSettingsToStateMap[k]] === 'object') {
          // handle the zmqServices object
          // (its explicitly one level deep, so for simplicity,
          //  we iterate its keys here rather than going fully recursive or something wasteful)
          const objKeys = Object.keys(settings[k]);
          if ((objKeys.length === 0) && (Object.keys(currentState[this.IPCSettingsToStateMap[k]]).length === 0)) {
            // skip; neither has values
          } else if ((objKeys.length === 0) && (Object.keys(currentState[this.IPCSettingsToStateMap[k]]).length > 0)) {
            // reset state to empty: received value is empty
            patchable[this.IPCSettingsToStateMap[k]] = {}
          } else {
            patchable[this.IPCSettingsToStateMap[k]] = { };
            objKeys.forEach(objKey => {
              if (typeof settings[k][objKey] === 'string') {
                patchable[this.IPCSettingsToStateMap[k]][objKey] = settings[k][objKey];
              }
            });
          }
        } else if (settings[k] !== currentState[k]) {
          patchable[this.IPCSettingsToStateMap[k]] = settings[k];
        }
      }
    });

    if (Object.keys(patchable).length > 0) {
      let isStopping =
        (currentState.running === RunningStatus.STARTED)
        && (patchable.running === RunningStatus.STOPPING || patchable.running === RunningStatus.STOPPED);
      let isStarted = (currentState.running !== RunningStatus.STARTED) && (patchable.running === RunningStatus.STARTED);
      ctx.patchState(patchable);
      if (isStopping || isStarted) {
        if (isStopping) {
          ctx.dispatch(new ParticlInternalActions.BlockchainStopped());
        }
        if (isStarted) {
          ctx.dispatch(new ParticlInternalActions.BlockchainStarted());
        }
      }
    }
  }


  @Action(GlobalActions.Initialize)
  setupInitialization(ctx: StateContext<ParticlCoreStateModel>) {
    const currentState = ctx.getState();
    if (!currentState.statusListening) {
      ctx.patchState({ statusListening: true });
      this._backendService.listen('coreManager:particl:status').pipe(
        tap((data: IPCResponses.CoreManager.Events.ParticlStatus) =>
          ctx.dispatch(new ParticlInternalActions.UpdateStatus(data))
        ),
        takeUntil(this.destroy$)
      ).subscribe();
    }
    return timer(1_500).pipe(
      tap(() => ctx.dispatch(new ParticlActions.RequestAction('initialize'))),
      takeUntil(this.destroy$)
    );
  }


  @Action(ParticlActions.RequestAction)
  doAction(ctx: StateContext<ParticlCoreStateModel>, { action }: ParticlActions.RequestAction) {
    switch (action) {
      case 'initialize': return this._backendService.send('coreManager:initialize', 'particl'); break;
      case 'start': return this._backendService.send('coreManager:start', 'particl'); break;
      case 'stop': return this._backendService.send('coreManager:stop', 'particl'); break;
    }
  }
}




@State({
  name: NETWORK_PARTICL_ZMQ_STATE_TOKEN,
  defaults: {
    statusListening: false,
    listeners: {}
  },
})
@Injectable()
export class ParticlZMQState {

  static get(field: string) {
    return createSelector(
      [ParticlZMQState],
      (state: ParticlZMQStateModel): string | undefined => {
        return state.listeners[field];
      }
    );
  }


  static getData(field: string) {
    return createSelector(
      [ParticlZMQState.get(field)],
      (fieldData: string | undefined): string | undefined => {
        return fieldData ? fieldData : null;
      }
    );
  }


  private destroy$: Subject<void> = new Subject();


  constructor(private _backendService: BackendService) { }


  @Action(ParticlInternalActions.UpdateZMQ)
  updateZMQData(ctx: StateContext<ParticlZMQStateModel>, { message }: ParticlInternalActions.UpdateZMQ) {
    if (!message) {
      return;
    }

    const currentState = ctx.getState();

    if (message.status === 'closed') {
      if (message.channel in currentState.listeners) {
        ctx.setState(patch<ParticlZMQStateModel>({
          listeners: patch({
            [message.channel]: null,
          })
        }));
      }
    } else {
      ctx.setState(patch<ParticlZMQStateModel>({
        listeners: patch({
          [message.channel]: message.data || null,
        })
      }));
    }
  }


  @Action(ParticlActions.RequestAction)
  doAction(ctx: StateContext<ParticlZMQStateModel>, { action }: ParticlActions.RequestAction) {
    if (action === 'stop') {
      this.destroy$.next();
      ctx.patchState({
        statusListening: false,
        listeners: {}
      });
      return;
    }

    if (!ctx.getState().statusListening && (action === 'start') || (action === 'initialize')) {
      this.setupStatusListener(ctx.dispatch);
    }
  }


  private setupStatusListener(dispatcherFn: (actions: any) => Observable<void>) {
    this._backendService.listen('coreManager:particl:zmq').pipe(
      filter((message: IPCResponses.CoreManager.Events.ParticlZMQ) =>
        message &&
        (message.status === 'data' || message.status === 'connected' || message.status === 'closed')
      ),
      tap((data: IPCResponses.CoreManager.Events.ParticlZMQ) =>
        dispatcherFn(new ParticlInternalActions.UpdateZMQ(data))
      ),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}



@State({
  name: NETWORK_PARTICL_BLOCKCHAIN_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_PARTICL_BLOCKCHAIN_STATE))
})
@Injectable()
export class ParticlBlockchainState {

  @Selector()
  static _peersList(state: ParticlBlockchainStateModel) {
    return state.peers;
  }

  static peersInfo() {
    return createSelector(
      [ParticlBlockchainState._peersList],
      (peers: {address: string; blockHeight: number}) => peers
    );
  }

  static highestPeerBlockCount() {
    return createSelector(
      [ParticlBlockchainState.peersInfo()],
      (peers: {address: string; blockHeight: number}[]) => {
        return peers.reduce((acc, peer) => +peer.blockHeight > +acc ? +peer.blockHeight : +acc, 0);
      }
    );
  }


  @Selector()
  static blockHeight(state: ParticlBlockchainStateModel) {
    return state.currentBlockHeight;
  }


  static isBlockchainSynced() {
    const LEEWAY = 5;
    return createSelector(
      [ParticlBlockchainState.highestPeerBlockCount(), ParticlBlockchainState.blockHeight],
      (peersCount: number, blockcount: number) => {
        return (peersCount > 0) && (blockcount > 0) ? blockcount > (peersCount - LEEWAY) : false;
      }
    );
  }


  @Selector()
  static network(state: ParticlBlockchainStateModel) {
    return state.networkInfo;
  }

  static networkValue(field: keyof ParticlBlockchainStateModel['networkInfo']) {
    return createSelector(
      [ParticlBlockchainState],
      (state: ParticlBlockchainStateModel) => {
        return state.networkInfo[field];
      }
    );
  }


  @Selector()
  static _chain(state: ParticlBlockchainStateModel) {
    return state.chain;
  }


  static chainType() {
    return createSelector(
      [ParticlBlockchainState._chain],
      (chain: ChainType) => chain
    );
  }


  private destroy$: Subject<void> = new Subject();


  constructor(
    private _rpc: RpcService
  ) {}


  @Action(ParticlInternalActions.BlockchainStarted)
  startPolling(ctx: StateContext<ParticlBlockchainStateModel>) {
    this.cleanupBlockchainState(ctx);

    const obsList: Observable<any>[] = [];

    const peers$ = of({}).pipe(
      mergeMap(_ =>
        this._rpc.call<RPCResponses.GetPeerInfo>('getpeerinfo').pipe(
          catchError(() => of(null))
        )
      ),
      tap({
        next: (peers: RPCResponses.GetPeerInfo | null) => {
          if (!Array.isArray(peers)) {
            return;
          }
          const formattedPeers = peers.map(p => ({
            address: (typeof p.addr === 'string') && p.addr ? p.addr : '',
            blockHeight: +p.currentheight >= 0 ? +p.currentheight : -1,
          }));

          const currentStatePeers = ctx.getState().peers;
          if (
            (currentStatePeers.length !== formattedPeers.length) ||
            (xorWith<{address: string; blockHeight: number}>(
              currentStatePeers,
              formattedPeers,
              (curr, req) =>
                (curr.address === req.address) &&
                (curr.blockHeight === req.blockHeight)
            ).length > 0)
          ) {
            ctx.setState(patch<ParticlBlockchainStateModel>({
              peers: formattedPeers
            }));
          }
        }
      }),
      delay(10_000),
      repeat(),
      takeUntil(this.destroy$)
    );
    obsList.push(peers$);

    const network$ = of({}).pipe(
      mergeMap(_ =>
        this._rpc.call('getnetworkinfo').pipe(
          catchError(err => of(null))
        )
      ),
      tap({
        next: (netinfo) => {
          if (Object.prototype.toString.call(netinfo) !== '[object Object]') {
            return;
          }

          const newVals = {};
          const currentState = ctx.getState().networkInfo;
          const currentKeys = Object.keys(currentState);
          for (const key of currentKeys) {
            if (
              (netinfo[key] !== null) &&
              (typeof netinfo[key] === typeof currentState[key]) &&
              (netinfo[key] !== currentState[key])
            ) {
              newVals[key] = netinfo[key];
            }
          }
          if (Object.keys(newVals).length > 0) {
            ctx.patchState({networkInfo: {...currentState, ...newVals}});
          }
        }
      }),
      delay(9_500),
      repeat(),
      takeUntil(this.destroy$)
    );
    obsList.push(network$);

    const blockcount$ = of({}).pipe(
      mergeMap(_ =>
        this._rpc.call<number>('getblockcount').pipe(
          catchError(err => of(null))
        )
      ),
      tap({
        next: height => {
          if ((+height > 0) && (+height !== ctx.getState().currentBlockHeight)) {
            ctx.setState(patch<ParticlBlockchainStateModel>({
              currentBlockHeight: +height
            }));
          }
        }
      }),
      delay(7_000),
      repeat(),
      takeUntil(this.destroy$)
    );
    obsList.push(blockcount$);


    const blockchain$ = this._rpc.call<RPCResponses.GetBlockchainInfo>('getblockchaininfo').pipe(
      retryWhen (
        errors => errors.pipe(
          delayWhen(() => timer(1000)), // retry every 1000 ms if an error occurs
        )
      ),
      tap((blockchaininfo) => {
          if (blockchaininfo && ('chain' in blockchaininfo)) {
            ctx.patchState({chain: blockchaininfo.chain});
          }
      })
    );
    obsList.push(blockchain$);

    merge(...obsList).pipe(takeUntil(this.destroy$)).subscribe();

  }


  @Action(ParticlInternalActions.BlockchainStopped)
  cleanupBlockchainState(ctx: StateContext<ParticlBlockchainStateModel>) {
    this.destroy$.next();
    ctx.setState(JSON.parse(JSON.stringify(DEFAULT_PARTICL_BLOCKCHAIN_STATE)));
  }
}




@State({
  name: NETWORK_PARTICL_WALLET_STAKING_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_STAKING_INFO_STATE))
})
@Injectable()
export class WalletStakingState {

  static getValue(field: string) {
    return createSelector(
      [WalletStakingState],
      (state: WalletStakingStateModel): number | string | boolean | null => {
        return field in state ? state[field] : null;
      }
    );
  }


  private isValidWallet: boolean = false;


  constructor(
    private _walletService: ParticlWalletService
  ) {}


  @Action(ParticlActions.WalletActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletStakingStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_STAKING_INFO_STATE)));
  }


  @Action(ParticlInternalActions.WalletActions.WalletLoaded)
  initializeWalletColdStakingData(ctx: StateContext<WalletStakingStateModel>, { walletName, isInitialized }: ParticlInternalActions.WalletActions.WalletLoaded) {
    this.isValidWallet = isInitialized;

    if (this.isValidWallet) {
      return this.updateState(ctx);
    }
  }


  @Action(ParticlActions.WalletActions.UpdateColdStakingInfo)
  fetchColdStakingData(ctx: StateContext<WalletStakingStateModel>) {
    if (this.isValidWallet) {
      return this.updateState(ctx);
    }
  }


  private updateState(ctx: StateContext<WalletStakingStateModel>): Observable<RPCResponses.GetColdStakingInfo> {
    return this._walletService.getColdStakingInfo().pipe(
      tap((result) => {

        const updatedValues = {};
        const currentState = ctx.getState();

        if (typeof result.enabled === typeof currentState.cold_staking_enabled) {
          updatedValues['cold_staking_enabled'] = result.enabled;
        }

        if (typeof result.coin_in_coldstakeable_script === typeof currentState.coin_in_stakeable_script) {
          updatedValues['coin_in_stakeable_script'] = result.coin_in_stakeable_script;
        }

        if (typeof result.percent_in_coldstakeable_script === typeof currentState.percent_in_coldstakeable_script) {
          updatedValues['percent_in_coldstakeable_script'] = result.percent_in_coldstakeable_script;
        }

        if (Object.keys(updatedValues).length > 0 ) {
          ctx.patchState(updatedValues);
        }
      })
    );
  }
}



@State<WalletInfoStateModel>({
  name: NETWORK_PARTICL_WALLET_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE))
})
@Injectable()
export class WalletInfoState {

  static getValue(field: keyof WalletInfoStateModel) {
    return createSelector(
      [WalletInfoState],
      (state: WalletInfoStateModel): WalletInfoStateModel[keyof WalletInfoStateModel] => {
        return field in state ? state[field] : null;
      }
    );
  }

  static hasEncryptionPassword() {
    return createSelector(
      [WalletInfoState.getValue('encryptionstatus')],
      (status: string): boolean => ['Locked', 'Unlocked, staking only', 'Unlocked'].includes(status)
    );
  }


  constructor(
    private _walletService: ParticlWalletService
  ) {}


  // @Action(ParticlInternalActions.BlockchainStarted)
  // fetchInitialWalletDetails(ctx: StateContext<WalletInfoStateModel>) {
  //   // fetch initial wallet details (previously saved wallet);
  //   // attempt to load fetched wallet (can be checked with listwalletdir et al, see old multiwallet service);
  //   // if wallet not available, fall back to whatever wallet is currently loaded, if any;
  //   // if wallet is loaded, fetch those details.
  //   //* If any wallet was loaded, dispatch WalletLoaded action
  // }


  @Action(ParticlInternalActions.BlockchainStopped)
  cleanupWalletDetails(ctx: StateContext<WalletInfoStateModel>) {
    return ctx.dispatch(new ParticlActions.WalletActions.ResetWallet());
  }


  @Action(ParticlActions.WalletActions.ResetWallet)
  resetStateToDefault(ctx: StateContext<WalletInfoStateModel>) {
    // Explicitly reset the state
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE)));
  }


  @Action(ParticlActions.WalletActions.ChangeWallet)
  changeActiveWallet(ctx: StateContext<WalletInfoStateModel>, { wallet }: ParticlActions.WalletActions.ChangeWallet) {
    const currentState = ctx.getState();
    if (currentState.walletname === wallet) {
      // no need to process further: wallet requested is the current wallet
      return;
    }
    return this._walletService.loadWallet(wallet).pipe(
      concatMap(walletLoaded => iif(
        () => walletLoaded,
        defer(() => {
          const newState = JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE));
          newState.walletname = wallet;
          ctx.patchState(newState);
          return this.updateWalletInfo(ctx, true);
        })
      ))
    );
  }


  @Action(ParticlActions.WalletActions.RefreshWalletInfo)
  refreshWalletInfo(ctx: StateContext<WalletInfoStateModel>) {
    if (ctx.getState().walletname !== null) {
      return this.updateWalletInfo(ctx, false);
    }
  }


  private updateWalletInfo(ctx: StateContext<WalletInfoStateModel>, newWalletLoaded: boolean = false): Observable<RPCResponses.GetWalletInfo> {
    return this._walletService.getWalletInfo(1).pipe(
      tap((info) => {
        if ( (typeof info === 'object')) {
          const currentState = ctx.getState();
          const initialSeedId = currentState.hdseedid;
          const newState = JSON.parse(JSON.stringify(DEFAULT_WALLET_STATE));
          const keys = Object.keys(newState);

          for (const key of keys) {
            if ((key in info) && (newState[key] !== info[key])) {
              newState[key] = info[key];
            }
          }
          ctx.patchState(newState);
          if (newWalletLoaded || ('hdseedid' in newState) && (newState.hdseedid !== initialSeedId) ) {
            const updatedState = ctx.getState();
            ctx.dispatch(new ParticlInternalActions.WalletActions.WalletLoaded(updatedState.walletname, !!updatedState.hdseedid));
          }
        }
      })
    );
  }
}




@State({
  name: NETWORK_PARTICL_WALLET_UTXOS_TOKEN,
  defaults: JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE))
})
@Injectable()
export class WalletBalanceState {

  static getValue(field: string) {
    return createSelector(
      [WalletBalanceState],
      (state: WalletBalanceState): any[] => {
        return field in state ? state[field] : [];
      }
    );
  }


  static utxosPublic() {
    return createSelector(
      [WalletBalanceState.getValue('public')],
      (utxos: PublicUTXO[]): PublicUTXO[] => utxos
    );
  }


  static utxosBlind() {
    return createSelector(
      [WalletBalanceState.getValue('blind')],
      (utxos: BlindUTXO[]): BlindUTXO[] => utxos
    );
  }


  static utxosAnon() {
    return createSelector(
      [WalletBalanceState.getValue('anon')],
      (utxos: AnonUTXO[]): AnonUTXO[] => utxos
    );
  }


  static spendableAmountPublic() {
    return createSelector(
      [WalletBalanceState.utxosPublic()],
      (utxos: PublicUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableAmountBlind() {
    return createSelector(
      [WalletBalanceState.utxosBlind()],
      (utxos: BlindUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableAmountAnon() {
    return createSelector(
      [WalletBalanceState.utxosAnon()],
      (utxos: AnonUTXO[]): string => WalletBalanceState.calculateSpendableAmounts(utxos)
    );
  }


  static spendableTotal() {
    return createSelector(
      [WalletBalanceState.spendableAmountPublic(), WalletBalanceState.spendableAmountBlind(), WalletBalanceState.spendableAmountAnon()],
      (p: string, b: string, a: string): string => (new PartoshiAmount(+p, false))
        .add(new PartoshiAmount(+b, false))
        .add(new PartoshiAmount(+a, false))
        .particlsString()
    );
  }

  static lockedPublic() {
    return createSelector(
      [WalletBalanceState.getValue('lockedPublic')],
      (value: number): number => value
    );
  }

  static lockedBlind() {
    return createSelector(
      [WalletBalanceState.getValue('lockedBlind')],
      (value: number): number => value
    );
  }

  static lockedAnon() {
    return createSelector(
      [WalletBalanceState.getValue('lockedAnon')],
      (value: number): number => value
    );
  }

  static lockedTotal() {
    return createSelector(
      [WalletBalanceState.lockedPublic(), WalletBalanceState.lockedBlind(), WalletBalanceState.lockedAnon()],
      (p: number, b: number, a: number): number => (new PartoshiAmount(p, false))
        .add(new PartoshiAmount(b, false))
        .add(new PartoshiAmount(a, false))
        .particls()
    );
  }


  private static calculateSpendableAmounts(utxos: PublicUTXO[] | BlindUTXO[] | AnonUTXO[]) {
    const tempBal = new PartoshiAmount(0);

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount));
      }
    }

    return tempBal.particlsString();
  }

  private isWalletValid: boolean = false;


  constructor(
    private _walletService: ParticlWalletService
  ) {}


  @Action(ParticlActions.WalletActions.ResetWallet)
  onResetStateToDefault(ctx: StateContext<WalletBalanceStateModel>) {
    // Explicitly reset the state only
    ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE)));
  }

  @Action(ParticlInternalActions.WalletActions.WalletLoaded)
  initializeWalletBalances(ctx: StateContext<WalletBalanceStateModel>, { isInitialized }: ParticlInternalActions.WalletActions.WalletLoaded) {
    this.isWalletValid = isInitialized;

    if (!this.isWalletValid) {
      ctx.patchState(JSON.parse(JSON.stringify(DEFAULT_UTXOS_STATE)));
      return;
    }

    return this.fetchWalletBalances(ctx);
  }


  @Action(ParticlActions.WalletActions.RefreshBalances)
  fetchWalletBalances(ctx: StateContext<WalletBalanceStateModel>) {
    return forkJoin({
      utxos: this._walletService.getAllUTXOs().pipe(
        map((result) => {

          const updatedValues = {};
          const currentState = ctx.getState();

          const resultKeys = Object.keys(result);
          for (const resKey of resultKeys) {
            if (resKey in currentState) {
              if (!result[resKey].length) {
                updatedValues[resKey] = [];
              } else if (
                (currentState[resKey].length !== result[resKey].length) ||
                (xorWith<PublicUTXO | BlindUTXO | AnonUTXO>(
                  currentState[resKey],
                  result[resKey],
                  (val, otherVal) => (val.txid === otherVal.txid) && (val.vout === otherVal.vout)
                ).length > 0)
              ) {
                updatedValues[resKey] = result[resKey];
              }
            }
          }

          return updatedValues;
        })
      ),

      locked: this._walletService.getLockedBalance().pipe(
        map(result => {
          const currentState = ctx.getState();
          const updatedValues = {};

          if (currentState.lockedPublic !== result.public) { updatedValues['lockedPublic'] = result.public; }
          if (currentState.lockedBlind !== result.blind) { updatedValues['lockedBlind'] = result.blind; }
          if (currentState.lockedAnon !== result.anon) { updatedValues['lockedAnon'] = result.anon; }

          return updatedValues;
        })
      )
    }).pipe(
      tap(updates => {
        const updatedValues = { ...updates.locked, ...updates.utxos };
        if (Object.keys(updatedValues).length > 0) {
          ctx.patchState(updatedValues);
        }
      })
    );
  }
}
