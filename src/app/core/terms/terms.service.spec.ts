import { TestBed, inject } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';

import { TermsService } from './terms.service';


describe('TermsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MatDialogModule ],
      providers: [TermsService]
    });
  });

  it('should be created', inject([TermsService], (service: TermsService) => {
    expect(service).toBeTruthy();
  }));
});
