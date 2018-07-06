import { TestBed, inject } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TermsService } from './terms.service';

describe('TermsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
				BrowserAnimationsModule,
				MatDialogModule
			]
      providers: [ TermsService ]
    });
  });

  it('should be created', inject([TermsService], (service: TermsService) => {
    expect(service).toBeTruthy();
  }));
});
