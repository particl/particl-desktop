import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  takeUntil, tap
} from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { WalletInfoState } from 'app/main/store/main.state';
import { WalletInfoStateModel } from 'app/main/store/main.models';


enum TextContent {

}



@Component({
  selector: 'market-chat-participants',
  templateUrl: './chat-participants.component.html',
  styleUrls: ['./chat-participants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatParticipantsComponent implements OnInit, OnDestroy {


  private destroy$: Subject<void> = new Subject();
  private controlLoadUsers: FormControl = new FormControl(0);


  constructor(
    private _store: Store,
  ) { }

  ngOnInit() {

    // const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
    //   tap((identity) => {
    //     if (identity && identity.id > 0) {
    //       const walletState: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);
    //       this.identityIsEncrypted = (+walletState.unlocked_until > 0) || (walletState.encryptionstatus !== 'Unencrypted');
    //     }
    //     this.controlLoadChats.setValue(identity.id);
    //   }),
    //   takeUntil(this.destroy$)
    // );


    // const loadChatMessages$ = this.controlLoadChats.valueChanges.pipe(

    //   takeUntil(this.destroy$)
    // )
  }


  ngOnDestroy() {
  }

}
