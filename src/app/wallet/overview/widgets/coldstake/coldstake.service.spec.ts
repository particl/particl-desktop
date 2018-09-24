import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';

import { ColdstakeService } from './coldstake.service';

describe('ColdstakeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
      ],
      providers: [ColdstakeService]
    });
  });

  it('should be created', inject([ColdstakeService], (service: ColdstakeService) => {
    expect(service).toBeTruthy();
  }));
});
