import { TestBed, inject } from '@angular/core/testing';

import { ProposalsNotificationsService } from './proposals-notifications.service';

describe('ProposalsNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProposalsNotificationsService]
    });
  });

  it('should be created', inject([ProposalsNotificationsService], (service: ProposalsNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
