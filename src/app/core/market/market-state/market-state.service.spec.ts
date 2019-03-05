import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../market.module';

import { MarketStateService } from './market-state.service';

describe('MarketStateService', () => {
  const timeout = 3 * 60;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [MarketStateService]
    });
  });

  it('should be created', inject([MarketStateService], (service: MarketStateService) => {
    expect(service).toBeTruthy();
  }));

  it(
    `should determineTimeoutDuration return timeout = ${timeout} for ${0} error`,
    inject([MarketStateService], (service: MarketStateService) => {

      expect(service).toBeTruthy();

      const errors = 0;
      const responseTimeout = service.determineTimeoutDuration(errors, timeout);
      expect(responseTimeout).not.toBe(0);
      expect(responseTimeout).toBe(timeout);
    })
  );

  it(
    `should determineTimeoutDuration return ${2000} timeout with ${2} errors count`,
    inject([MarketStateService], (service: MarketStateService) => {
      expect(service).toBeTruthy();

      const errors = 2;

        const responseTimeout = service.determineTimeoutDuration(errors, timeout);
        expect(responseTimeout).not.toBe(0);
        expect(responseTimeout).toBe(1000); // 1 sec.
    })
  )

  it(
    `should determineTimeoutDuration ${10000} timeout with ${30} error count`,
    inject([MarketStateService], (service: MarketStateService) => {
      expect(service).toBeTruthy();

      const errors = 30;

      const responseTimeout = service.determineTimeoutDuration(errors, timeout);
      expect(responseTimeout).not.toBe(0);
      expect(responseTimeout).toBe(10000); // 10 sec.
    })
  )
});
