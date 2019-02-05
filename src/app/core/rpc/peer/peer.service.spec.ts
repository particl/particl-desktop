import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreModule } from '../../core.module';

import { RpcService } from 'app/core/rpc/rpc.service';
import { PeerService } from './peer.service';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';

fdescribe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot()
      ],
      providers: [
      PeerService,
      { provide: RpcService, useClass: RpcMockService }
      ]
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));

  it('should return block count', inject([PeerService], (service: PeerService) => {
    service.getPeerList().subscribe(block => {
      expect(block).toEqual(336460);
    })
  }));

  it('should return peerlist', inject([PeerService], (service: PeerService) => {
    service.getPeerList().subscribe(peerlist => {
      expect(peerlist.length).toBeGreaterThan(0);
    })
  }));

});
