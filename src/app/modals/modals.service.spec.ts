import { TestBed, inject } from '@angular/core/testing';

import { ModalsModule } from './modals.module';

import { StatusService } from '../core/status/status.service';
import { ModalsService } from './modals.service';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule
      ],
      providers: [
        StatusService
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
