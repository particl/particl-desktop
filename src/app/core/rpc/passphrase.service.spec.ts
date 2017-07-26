import { TestBed, inject } from '@angular/core/testing';

import { PassphraseService } from './passphrase.service';

describe('PassphraseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PassphraseService]
    });
  });

  it('should be created', inject([PassphraseService], (service: PassphraseService) => {
    expect(service).toBeTruthy();
  }));
});
