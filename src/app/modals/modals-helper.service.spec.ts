import { TestBed, inject } from '@angular/core/testing';

import { ModalsHelperService } from './modals-helper.service';

describe('ModalsHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalsHelperService]
    });
  });

  it('should be created', inject([ModalsHelperService], (service: ModalsHelperService) => {
    expect(service).toBeTruthy();
  }));
});
