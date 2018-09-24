import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreModule } from '../../core.module';

import { PeerService } from './peer.service';

describe('PeerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot()
      ],
      providers: [
      ]
    });
  });

  it('should be created', inject([PeerService], (service: PeerService) => {
    expect(service).toBeTruthy();
  }));
});
