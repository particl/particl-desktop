import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { ProfileService } from './profile.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { IpcService } from 'app/core/ipc/ipc.service';

describe('ProfileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MarketModule.forRoot()
      ],
      providers: [
        IpcService,
        ProfileService
      ]
    });
  });

  it('should be created', inject([ProfileService], (service: ProfileService) => {
    expect(service).toBeTruthy();
  }));
});
