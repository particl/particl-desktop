import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from 'app/core/core.module';

import { ConnectionCheckerService } from './connection-checker.service';

describe('ConnectionCheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionCheckerService],
      imports: [
        CoreModule.forRoot()
      ]
    });
  });

  it('should be created', inject([ConnectionCheckerService], (service: ConnectionCheckerService) => {
    expect(service).toBeTruthy();
  }));
});
