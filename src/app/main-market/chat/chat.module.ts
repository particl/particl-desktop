import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { ChatComponent } from './chat.component';
import { ChatChannelsComponent } from './chat-channels/chat-channels.component';
import { ChatParticipantsComponent } from './chat-participants/chat-participants.component';
import { UnfollowChannelConfirmationModalComponent } from './chat-modals/unfollow-confirmation-modal/unfollow-confirmation-modal.component';
import { ChatParticipantRemoveConfirmationModalComponent } from './chat-modals/chat-participant-remove-confirmation-modal/chat-participant-remove-confirmation-modal.component';
import { ChatParticipantEditModalComponent } from './chat-modals/chat-participant-edit-modal/chat-participant-edit-modal.component';

const routes: Routes = [
  { path: '', component: ChatComponent, data: { title: 'Chat Messages'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule,
    ClipboardModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ChatComponent,
    ChatChannelsComponent,
    ChatParticipantsComponent,
    UnfollowChannelConfirmationModalComponent,
    ChatParticipantRemoveConfirmationModalComponent,
    ChatParticipantEditModalComponent,
  ],
  entryComponents: [
    UnfollowChannelConfirmationModalComponent,
    ChatParticipantRemoveConfirmationModalComponent,
    ChatParticipantEditModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatModule { }
