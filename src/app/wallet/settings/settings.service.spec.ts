import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { CoreModule } from 'app/core/core.module';
import { SettingsService } from './settings.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { ModalsModule } from 'app/modals/modals.module';

describe('SettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule.forRoot()
      ],
      providers: [
        SettingsService
      ]
    });
  });

  it('should be created', inject([SettingsService], (service: SettingsService) => {
    expect(service).toBeTruthy();
  }));
});
