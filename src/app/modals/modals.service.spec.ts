import { TestBed, inject } from '@angular/core/testing';

import { ModalsModule } from './modals.module';

import { BlockStatusService } from '../core/rpc/blockstatus.service';
import { ModalsService } from './modals.service';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule
      ],
      providers: [
        BlockStatusService
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
