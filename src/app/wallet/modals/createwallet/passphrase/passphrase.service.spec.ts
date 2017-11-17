import { TestBed, inject } from '@angular/core/testing';

import {SharedModule} from "../../../shared/shared.module";
import {RpcModule} from "../../../../core/rpc/rpc.module";

import { PassphraseService } from './passphrase.service';

describe('PassphraseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [PassphraseService]
    });
  });

  it('should be created', inject([PassphraseService], (service: PassphraseService) => {
    expect(service).toBeTruthy();
  }));
});
