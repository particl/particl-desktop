import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreModule} from '../../../core/core.module';
import { PassphraseService } from './passphrase.service';

describe('PassphraseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forTest()
      ],
      providers: [PassphraseService]
    });
  });

  it('should be created', inject([PassphraseService], (service: PassphraseService) => {
    expect(service).toBeTruthy();
  }));
});
