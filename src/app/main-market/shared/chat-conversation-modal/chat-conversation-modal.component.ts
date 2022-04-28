import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isBasicObjectType, getValueOrDefault } from '../utils';
import { ChatChannelType } from './../../services/chats/chats.models';

enum TextContent {
  LABEL_UNKNOWN = '<unknown>',
}


export interface ChatConversationModalInputs {
  title: string;
  subtitle: string;
  channel: string;
  channelType: ChatChannelType;
  highlitedAddress?: string;
  highlitedLabel?: string;
}

/**
 * Simple modal wrapper around the chat-message component
 */
@Component({
  templateUrl: './chat-conversation-modal.component.html',
  styleUrls: ['./chat-conversation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatConversationModalComponent {

  readonly componentData: ChatConversationModalInputs;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ChatConversationModalInputs,
  ) {

    this.componentData = {
      channel: '',
      channelType: ChatChannelType.OTHER,
      subtitle: '',
      title: TextContent.LABEL_UNKNOWN,
    };

    if (isBasicObjectType(data)) {
      this.componentData.channel = getValueOrDefault(this.data.channel, 'string', ''),
      this.componentData.channelType = this.data.channelType;
      this.componentData.title = getValueOrDefault(this.data.title, 'string', this.componentData.title);
      this.componentData.subtitle = getValueOrDefault(this.data.subtitle, 'string', this.componentData.subtitle);

      this.componentData.highlitedAddress = getValueOrDefault(this.data.highlitedAddress, 'string', '');
      this.componentData.highlitedLabel = getValueOrDefault(this.data.highlitedLabel, 'string', '');
    }
  }
}
