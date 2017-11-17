import { TestBed, inject } from '@angular/core/testing';

import {SharedModule} from "../../../wallet/shared/shared.module";
import {RpcModule} from "../rpc.module";

import {PeerService} from "./peer.service";


describe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ]
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));
});
