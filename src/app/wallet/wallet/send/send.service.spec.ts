import { TestBed, inject } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module'; // is this even needed?

import { SendService } from './send.service';

describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot(),
        MdSnackBarModule
      ],
      providers: [SendService]

    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
