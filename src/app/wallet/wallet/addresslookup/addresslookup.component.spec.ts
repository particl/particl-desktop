import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material';


import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

import { IpcService } from '../../../core/ipc/ipc.service';

import { AddressLookupComponent } from './addresslookup.component';

describe('AddressLookupComponent', () => {
  let component: AddressLookupComponent;
  let fixture: ComponentFixture<AddressLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        WalletModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should show', () => {
    component.show();
    expect(component.staticLookup.isShown).toBe(true);
  });

  it('should hide', () => {
    component.hide();
    expect(component.staticLookup.isShown).toBe(false);
  });
*/
  it('should get filterAddress', () => {
    expect(component.filter).toBe('All types');
  });

  // it('should get staticLookup', () => {
  //   expect(component.staticLookup).toBeDefined();
  // });
});
