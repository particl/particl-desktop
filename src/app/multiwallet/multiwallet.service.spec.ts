import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MultiwalletService } from './multiwallet.service';

import { CoreModule } from '../core/core.module';
import { MultiwalletModule } from './multiwallet.module';

describe('MultiwalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule.forTest(),
        MultiwalletModule.forTest()
      ]
    });
  });

  it('should be created', inject([MultiwalletService], (service: MultiwalletService) => {
    expect(service).toBeTruthy();
  }));
});
