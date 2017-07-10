import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule, PeerService } from './rpc.module';


describe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));
});
