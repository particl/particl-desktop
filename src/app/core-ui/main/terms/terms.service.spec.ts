import { TestBed, inject } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreUiModule } from '../../core-ui.module';
import { ModalsModule } from '../../../modals/modals.module';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        CoreUiModule.forRoot(),
        ModalsModule.forRoot()
      ],
      providers: [ TermsService ]
    });
  });

  it('should be created', inject([TermsService], (service: TermsService) => {
    expect(service).toBeTruthy();
  }));
});
