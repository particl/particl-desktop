import { Component, Input } from '@angular/core';
import { ModalsModule } from '../modals.module';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  @Input() openUnlockWalletModal: boolean = false;

  constructor (private _rpc: RPCService) { }

  unlock(obj: Object) {
    // unlock actually happened in password.component.ts
  }

  passw(json: Object) {
    console.log('passw triggered');
  }

}
