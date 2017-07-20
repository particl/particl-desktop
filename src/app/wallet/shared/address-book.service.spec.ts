import { TestBed, inject } from '@angular/core/testing';

import { AddressBookService } from './address-book.service';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../shared/shared.module';
import { RPCService } from '../../core/rpc/rpc.service';

describe('AddressBookService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        AddressBookService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should ...', inject([AddressBookService], (service: AddressBookService) => {
    expect(service).toBeTruthy();
  }));
});
