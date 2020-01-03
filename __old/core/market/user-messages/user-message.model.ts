
export enum UserMessageType {
  INFO = 'info',
  WARNING = 'warning',
  ALERT = 'alert'
}

export class UserMessage {
  text: string;
  dismissable: boolean;
  timeout: number;
  messageType: UserMessageType;
  action?: Function;
  actionLabel?: string;
}
