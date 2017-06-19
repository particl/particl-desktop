import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';

@Injectable()
export class AppService {
  public isElectron: boolean = false;

  constructor(public electronService: ElectronService) {
    this.isElectron = this.electronService.isElectronApp;
  }

}
