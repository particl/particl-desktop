import { TestBed, inject } from '@angular/core/testing';

import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module'; // is this even needed?

import { SendService } from './send.service';


describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [SendService]

    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
