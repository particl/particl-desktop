import { TestBed, inject } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material'; // needed?

import {SnackbarService} from './snackbar.service';


describe('SnackbarServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MdSnackBarModule
      ],
      providers: [SnackbarService]
    });
  });

  it('should be created', inject([SnackbarService], (service: SnackbarService) => {
    expect(service).toBeTruthy();
  }));
});
