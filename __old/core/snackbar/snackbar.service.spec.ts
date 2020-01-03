import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material'; // needed?

import {SnackbarService} from './snackbar.service';


describe('SnackbarServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule
      ],
      providers: [SnackbarService]
    });
  });

  it('should be created', inject([SnackbarService], (service: SnackbarService) => {
    expect(service).toBeTruthy();
  }));
});
