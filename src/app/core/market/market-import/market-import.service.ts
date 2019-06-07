import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { IpcService } from 'app/core/ipc/ipc.service';
import { take } from 'rxjs/operators';

@Injectable()
export class MarketImportService {

  private log: any = Log.create('market-import-service id: ' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private _ipc: IpcService
  ) { }

  async getImportConfig() {
    return new Promise((resolve) => {
      this._ipc.runCommand('importer-config', null, null).pipe(take(1)).subscribe((config) => resolve(config));
    });
  }

  loadListingsFromImporter(data) {
    return this._ipc.runCommand('importer-load', null, data);
  }

  validateListings(listings, country?, expTime?) {
    return this._ipc.runCommand('importer-validate', null, listings, country, expTime);
  }

  publishListings(listings, country, expTime) {
    return this._ipc.runCommand('importer-publish', null, listings, country, expTime);
  }

}