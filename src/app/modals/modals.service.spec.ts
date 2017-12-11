import { TestBed, inject } from '@angular/core/testing';

import { ModalsModule } from './modals.module';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../wallet/shared/shared.module';

import { ModalsService } from './modals.service';


describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        CoreModule.forRoot()
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
