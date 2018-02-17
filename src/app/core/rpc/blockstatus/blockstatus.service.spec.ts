import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';

import { BlockStatusService } from './blockstatus.service';

describe('BlockStatusService', () => {
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

  it('should be created', inject([BlockStatusService], (service: BlockStatusService) => {
    expect(service).toBeTruthy();
  }));
});
