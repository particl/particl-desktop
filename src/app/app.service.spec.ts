import { TestBed, inject } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';

import { AppService } from './app.service';

import { AppModule } from './app.module';

describe('AppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [ {provide: APP_BASE_HREF, useValue: '/'} ]
    });
  });

  it('should be created', inject([AppService], (service: AppService) => {
    expect(service).toBeTruthy();
  }));

  it('should not be electron', inject([AppService], (service: AppService) => {
    expect(service.isElectron).toBeFalsy();
  }));
});
