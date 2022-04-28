import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';
import { ChatChannelType } from '../../../services/chats/chats.models';


export interface UnfollowChannelConfirmationModalInput {
  title: string;
  subtitle: string;
  image: string;
  channelType: ChatChannelType;
}


enum TextContent {
  LABEL_UNKNOWN = '<unknown>',
}


@Component({
  templateUrl: './unfollow-confirmation-modal.component.html',
  styleUrls: ['./unfollow-confirmation-modal.component.scss']
})
export class UnfollowChannelConfirmationModalComponent {

  readonly dialogData: UnfollowChannelConfirmationModalInput;

  TypeChatChannel: typeof ChatChannelType = ChatChannelType;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: UnfollowChannelConfirmationModalInput,
    private _dialogRef: MatDialogRef<UnfollowChannelConfirmationModalComponent>,
  ) {
    this.dialogData = {
      title: TextContent.LABEL_UNKNOWN,
      subtitle: TextContent.LABEL_UNKNOWN,
      image: '',
      channelType: ChatChannelType.OTHER,
    };

    if (isBasicObjectType(this.data)) {
      this.dialogData.title = getValueOrDefault(this.data.title, 'string', this.dialogData.title);
      this.dialogData.subtitle = getValueOrDefault(this.data.subtitle, 'string', this.dialogData.subtitle);
      this.dialogData.image = getValueOrDefault(this.data.image, 'string', this.dialogData.image);
      this.dialogData.channelType = getValueOrDefault(
        this.data.channelType as string, 'string', this.dialogData.channelType
      ) as ChatChannelType;
    }
  }


  confirmAction() {
    this._dialogRef.close(true);
  }
}
