import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from 'app/core/core.module';
import { MarketModule } from '../../../market.module';

import { ImageService } from './image.service';

describe('ImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [ImageService]
    });
  });

  it('should be created', inject([ImageService], (service: ImageService) => {
    expect(service).toBeTruthy();
  }));
});
