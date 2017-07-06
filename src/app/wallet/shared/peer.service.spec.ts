import { TestBed, inject } from '@angular/core/testing';

import { PeerService } from './peer.service';

describe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PeerService]
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));
});
