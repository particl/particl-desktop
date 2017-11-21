import { TestBed, inject } from '@angular/core/testing';
import {SnackbarService} from './flash-notification.service';
import { MdSnackBarModule } from '@angular/material';


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
