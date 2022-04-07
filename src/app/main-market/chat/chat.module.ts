import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { ChatComponent } from './chat.component';
import { ChatChannelsComponent } from './chat-channels/chat-channels.component';
import { ChatParticipantsComponent } from './chat-participants/chat-participants.component';
import { UnfollowChannelConfirmationModalComponent } from './chat-modals/unfollow-confirmation-modal/unfollow-confirmation-modal.component';


const routes: Routes = [
  { path: '', component: ChatComponent, data: { title: 'Chat Messages'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ChatComponent,
    ChatChannelsComponent,
    ChatParticipantsComponent,
    UnfollowChannelConfirmationModalComponent,
  ],
  entryComponents: [
    UnfollowChannelConfirmationModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatModule { }
