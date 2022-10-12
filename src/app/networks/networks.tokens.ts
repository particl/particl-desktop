import { StateToken } from '@ngxs/store';
import {
    ParticlCoreStateModel, ParticlZMQStateModel,
    WalletInfoStateModel, WalletBalanceStateModel, WalletStakingStateModel, ParticlBlockchainStateModel,
    // WalletSettingsStateModel
} from './particl/particl.models';


export const NETWORK_PARTICL_STATE_TOKEN = new StateToken<ParticlCoreStateModel>('particl_core');
export const NETWORK_PARTICL_ZMQ_STATE_TOKEN = new StateToken<ParticlZMQStateModel>('particl_zmq');
export const NETWORK_PARTICL_BLOCKCHAIN_TOKEN = new StateToken<ParticlBlockchainStateModel>('particl_blockchain');
export const NETWORK_PARTICL_WALLET_TOKEN = new StateToken<WalletInfoStateModel>('particl_wallet');
export const NETWORK_PARTICL_WALLET_UTXOS_TOKEN = new StateToken<WalletBalanceStateModel>('particl_wallet_utxos');
// export const NETWORK_PARTICL_WALLET_SETTINGS_TOKEN = new StateToken<WalletSettingsStateModel>('particl_wallet_settings');
export const NETWORK_PARTICL_WALLET_STAKING_TOKEN = new StateToken<WalletStakingStateModel>('particl_wallet_staking');
