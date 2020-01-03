import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'app/core/core.module';

import { UserMessageService } from './user-message.service';

describe('ProposalsNotificationsService', () => {
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
});
