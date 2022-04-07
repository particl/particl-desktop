import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isBasicObjectType, getValueOrDefault } from '../utils';
import { ChatChannelType } from './../../services/chats/chats.models';

enum TextContent {
  LABEL_UNKNOWN = '<unknown>',
}


export interface ChatMessageModalInputs {
  title: string;
  subtitle: string;
  channel: string;
  channelType: ChatChannelType
}

/**
 * Simple modal wrapper around the chat-message component
 */
@Component({
  templateUrl: './chat-message-modal.component.html',
  styleUrls: ['./chat-message-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageModalComponent {

  readonly componentData: ChatMessageModalInputs;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ChatMessageModalInputs,
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
    }
  }
}
