import { TestBed, inject } from '@angular/core/testing';

import { ClientVersionService } from './client-version.service';
import { HttpClientModule } from '@angular/common/http';

describe('ClientVersionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [ClientVersionService]
    });
  });

  it('should be created', inject([ClientVersionService], (service: ClientVersionService) => {
    expect(service).toBeTruthy();
  }));
});
