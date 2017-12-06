import { TestBed, inject } from '@angular/core/testing';

import { ModalsModule } from './modals.module';
import { CoreModule } from '../core/core.module';

import { ModalsService } from './modals.service';
import { MatDialogModule, MatDialogRef } from '@angular/material';


  describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        ModalsModule,
        CoreModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef},
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
