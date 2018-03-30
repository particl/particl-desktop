import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { ImageService } from './image.service';

describe('ImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [ImageService]
    });
  });

  it('should be created', inject([ImageService], (service: ImageService) => {
    expect(service).toBeTruthy();
  }));
});
