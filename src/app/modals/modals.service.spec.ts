import { TestBed, inject } from '@angular/core/testing';

import { ModalsService } from './modals.service';
import { ModalsModule } from './modals.module';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalsModule]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
