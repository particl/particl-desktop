import { Injectable } from '@angular/core';
import { Observable, throwError, iif, defer, from } from 'rxjs';
import { mapTo, concatMap, map } from 'rxjs/operators';

import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { CoreErrorModel } from 'app/core/core.models';


@Injectable()
export class WalletSettingsService {

  constructor(
    private _rpc: MainRpcService,
    private _unlocker: WalletEncryptionService,
  ) {}


  changeWalletPassphrase(oldPassword: string, newPassword: string): Observable<boolean> {
    return iif(
      () => !!oldPassword && !!newPassword,

      defer(() => this._rpc.call('walletpassphrasechange', [oldPassword, newPassword])).pipe(
        mapTo(true)
      ),

      defer(() => throwError('invalid details'))
    );
  }


  createdDerivedWallets(walletLabels: string[], skipCount: number = 0): Observable<boolean[]> {
    if (!Array.isArray(walletLabels) || walletLabels.length <= 0) {
      return throwError('Invalid number of derived wallets requested');
    }

    return this._unlocker.unlock({timeout: walletLabels.length * 10}).pipe(
      concatMap(unlocked => iif(
        () => unlocked,

        defer(() => this.fetchExtKeyList(true).pipe(

          map(extKeys => {
            let masterKey: ExtKey;

            if (Array.isArray(extKeys)) {
              masterKey = extKeys.find(key => key.type === 'Loose' && key.key_type === 'Master' && key.label === 'Master Key - bip44 derived.' && key.current_master === 'true');
            }

            if (masterKey) {
              return masterKey;
            }

            throw new Error('Invalid or Unknown Master Key');
          }),

          concatMap(masterKey => from(this.createDerivedWallets(walletLabels, masterKey, skipCount)))
        ))

      ))
    );
  }


  private async createDerivedWallets(walletLabels: string[], extMasterKey: ExtKey, skipCount: number = 0): Promise<boolean[]> {
    let countProcessed = 0;
    let extraDerivedCount = 0;

    const successes = walletLabels.map(() => false);

    while (countProcessed < walletLabels.length) {
      const keyInfoResult: string = await this._rpc.call('extkey', ['info', extMasterKey.evkey, `4444446'/${skipCount + countProcessed + extraDerivedCount}'`]).toPromise()
        .then((keyInfo: ExtKeyInfo) => {
          if (
            keyInfo
            && (Object.prototype.toString.call(keyInfo) === '[object Object]')
            && (Object.prototype.toString.call(keyInfo.key_info) === '[object Object]')
            && (typeof keyInfo.key_info.result === 'string')
            && (keyInfo.key_info.result.length > 0)
          ) {
            return keyInfo.key_info.result;
          }
          return null;
        })
        .catch(() => null);

      if (!keyInfoResult) {
        ++countProcessed;
        continue;
      }

      const extKeyAlt: string = await this._rpc.call('extkeyaltversion', [keyInfoResult]).toPromise().catch(() => '');
      if (!extKeyAlt || (typeof extKeyAlt !== 'string')) {
        ++countProcessed;
        continue;
      }

      const derivedLabel = walletLabels[countProcessed];
      const walletPath: string = derivedLabel;    // can be reassigned as appropriate later if other paths become possible
      const walletCreated = await this._rpc.call('createwallet', [derivedLabel, false, true]).toPromise()
        .then((creationResult ) => {
          console.log('wallet creation result is: ', creationResult);
          return true;
        })
        .catch(() => false);
      if (!walletCreated) {
        ++countProcessed;
        continue;
      }

      const importedExtKey: ExtKeyResult = await this._rpc.call(
        'extkey',
        ['import', extKeyAlt, 'master key', true, true],
        walletPath
      ).toPromise()
        .then((result: ExtKeyResult) => {
          if (!result || (typeof result.id !== 'string') || (result.id.length < 1)) {
            throw new Error('invalid result');
          }
          return result;
        })
        .catch((err: CoreErrorModel) => {
          if (err && (typeof err.message === 'string') && err.message.toLowerCase().includes('already exists in wallet')) {
            ++extraDerivedCount;
          } else {
            ++countProcessed;
          }
          return null;
        });
      if (importedExtKey === null) {
        continue;
      }

      const _ = await this._rpc.call('extkey', ['setMaster', importedExtKey.id], walletPath).toPromise().catch(() => null);
      if (_ === null) {
        ++countProcessed;
        continue;
      }

      const derivedAccount: ExtKeyResult = await this._rpc.call(
        'extkey',
        ['deriveAccount', '', ],
        walletPath
      ).toPromise()
        .catch(() => null);
      if (!derivedAccount || typeof derivedAccount.account !== 'string') {
        ++countProcessed;
        continue;
      }

      const setDefaultResult = await this._rpc.call(
        'extkey',
        ['setDefaultAccount', derivedAccount.account],
        walletPath
      ).toPromise()
        .catch(() => null);
      if (setDefaultResult !== null) {
        successes[countProcessed] = true;
      }
      ++countProcessed;

      // generate initial addresses for the new wallet... if it fails for some reason then these can be easily generated manually elsewhere
      this._rpc.call('getnewaddress', [''], walletPath).toPromise().then(() => true).catch(() => false);
      this._rpc.call('getnewstealthaddress', [''], walletPath).toPromise().then(() => true).catch(() => false);

    }

    return successes;
  }


  private fetchExtKeyList(showSecrets: boolean = false): Observable<ExtKey[]> {
    return this._rpc.call('extkey', ['list', showSecrets]);
  }

}


interface ExtKey {
  type: 'Loose' | 'Account';
  receive_on?: 'false' | 'true';
  active: 'false' | 'true';
  encrypted: 'false' | 'true';
  hardware_device?: 'false' | 'true';
  label: string;
  default_account?: 'true' | 'false';
  created_at?: number;
  path?: string;
  has_secret?: 'true' | 'false';
  key_type?: 'Master';
  current_master?: 'false' | 'true';
  root_key_id?: string;
  id: string;
  evkey: string;
  epkey: string;
  external_chain?: string;
  internal_chain?: string;
  num_derives?: string;
  num_derives_hardened?: string;
  num_derives_external?: string;
  num_derives_external_h?: string;
  num_derives_internal?: string;
  num_derives_internal_h?: string;
  num_derives_stealth?: string;
  num_derives_stealth_h?: string;
}


interface ExtKeyInfo {
  key_info: {
    result: string;
    path: string;
  };
}


interface ExtKeyResult {
  result: string;
  id: string;
  key_label: string;
  note: string;
  account: string;
  label: string;
  key_info: unknown;
  account_id: string;
  has_secret: string;
  account_label: string;
  scanned_from: number;
}
