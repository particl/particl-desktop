import { TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'app/core/core.module';

import { UserMessageService } from './user-message.service';
import { UserMessageType, UserMessage } from './user-message.model';
import { AlphaMainnetWarningComponent } from 'app/modals/alpha-mainnet-warning/alpha-mainnet-warning.component';

describe('UserMessageService', () => {
  const alphaMessage = {
    text: 'The Particl Marketplace alpha is still in development and not 100% private yet - use it at your own risk!',
    dismissable: false,
    timeout: 0,
    messageType: UserMessageType.ALERT,
    action: () => { this.dialog.open(AlphaMainnetWarningComponent); },
    actionLabel: 'Click here to read all the details first!'
  } as UserMessage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot()
      ],
      providers: [
        UserMessageService
      ]
    });
  });

  it('should be created', inject([UserMessageService], (service: UserMessageService) => {
    expect(service).toBeTruthy();
  }));

  it(
    'should be addMessage method emit the message where it is subscribed',
    fakeAsync(
      inject([UserMessageService], (service: UserMessageService) => {
        expect(service).toBeTruthy();
        let message = null;
        service.message.subscribe((m) => {
          message = m;
        });

        expect(message).toBe(null);

        service.addMessage(alphaMessage);
        tick(1000);

        expect(message).not.toBe(null);
        expect(message).toEqual(alphaMessage);
      })
    )
  );
});
