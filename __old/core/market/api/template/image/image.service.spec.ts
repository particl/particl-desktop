import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { ImageService } from './image.service';

describe('ImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [ImageService]
    });
  });

  it('should be created', inject([ImageService], (service: ImageService) => {
    expect(service).toBeTruthy();
  }));
});
