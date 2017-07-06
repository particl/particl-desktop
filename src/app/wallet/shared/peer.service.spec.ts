import { TestBed, inject } from '@angular/core/testing';

import { PeerService } from './peer.service';

import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { PeerService } from '../../wallet/shared/peer.service';

describe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppService,
        RPCService,
        PeerService]
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));
});
